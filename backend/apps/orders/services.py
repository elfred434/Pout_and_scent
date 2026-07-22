import logging
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from datetime import timedelta

from apps.catalog.models import VarianteProduit
from apps.notifications.services import EmailService
from apps.promotions.services import PricingService
from apps.users.models import Adresse
from .models import Commande, LigneCommande, StatutCommande

logger = logging.getLogger(__name__)


class StockError(Exception):
    """Erreur liée à la gestion du stock."""
    pass


class StockService:
    @staticmethod
    @transaction.atomic
    def reserver(lignes_data: list[dict]):
        """
        Réserve le stock pour une commande avec verrouillage.
        lignes_data = [{'variante_id': uuid, 'quantite': int}, ...]
        """
        ids = [l["variante_id"] for l in lignes_data]

        # select_for_update() pour verrouiller les lignes et éviter les race conditions
        variantes = {
            str(v.id): v
            for v in VarianteProduit.objects.select_for_update().filter(id__in=ids)
        }

        for ligne in lignes_data:
            vid = str(ligne["variante_id"])
            v = variantes.get(vid)

            if not v:
                raise StockError(f"Variante {ligne['variante_id']} introuvable")
            if not v.is_active:
                raise StockError(f"Variante {v.sku} inactive")
            if v.stock < ligne["quantite"]:
                raise StockError(f"Stock insuffisant pour {v.sku} (disponible: {v.stock})")

            # Double-check atomique avec F() pour éviter les race conditions
            updated = VarianteProduit.objects.filter(
                id=v.id, stock__gte=ligne["quantite"]
            ).update(stock=F("stock") - ligne["quantite"])

            if not updated:
                raise StockError(f"Stock insuffisant pour {v.sku} (concurrence)")

            v.refresh_from_db()
            logger.info(
                "Stock réservé : %s — %d unité(s), restant: %d",
                v.sku, ligne["quantite"], v.stock,
            )

    @staticmethod
    @transaction.atomic
    def liberer(lignes):
        """Libère le stock d'une commande annulée/expirée."""
        for ligne in lignes:
            VarianteProduit.objects.filter(id=ligne.variante_id).update(
                stock=F("stock") + ligne.quantite
            )
            logger.info(
                "Stock libéré : variante %s — %d unité(s)",
                ligne.variante_id, ligne.quantite,
            )


class CheckoutService:
    @staticmethod
    @transaction.atomic
    def creer_commande(user, adresse_id, lignes_data: list[dict], notes_client=""):
        """Crée une commande avec réservation de stock atomique."""
        adresse = Adresse.objects.get(id=adresse_id, user=user)

        # ✅ CORRECTION : Fetch + lock atomique dans reserver()
        # On réserve d'abord le stock (avec select_for_update)
        StockService.reserver(lignes_data)

        # Puis on récupère les variantes (déjà verrouillées dans la même transaction)
        ids = [l["variante_id"] for l in lignes_data]
        variantes_map = {
            str(v.id): v
            for v in VarianteProduit.objects.filter(id__in=ids)
        }

        montant_total = Decimal("0")
        montant_reduit = Decimal("0")
        lignes_objs = []

        for ligne in lignes_data:
            variante = variantes_map.get(str(ligne["variante_id"]))
            if not variante:
                raise StockError(f"Variante {ligne['variante_id']} introuvable")

            prix_unitaire = PricingService.prix_final(variante)
            sous_total = (prix_unitaire * ligne["quantite"]).quantize(Decimal("0.01"))
            montant_total += variante.prix * ligne["quantite"]
            montant_reduit += sous_total
            lignes_objs.append({
                "variante": variante,
                "quantite": ligne["quantite"],
                "prix_unitaire": prix_unitaire,
                "sous_total": sous_total,
            })

        commande = Commande.objects.create(
            user=user,
            adresse=adresse,
            montant_total=montant_total.quantize(Decimal("0.01")),
            montant_reduit=montant_reduit.quantize(Decimal("0.01")),
            notes_client=notes_client,
            date_expiration_stock=timezone.now() + timedelta(hours=settings.STOCK_EXPIRY_HOURS),
        )

        for l in lignes_objs:
            LigneCommande.objects.create(commande=commande, **l)

        logger.info("Commande %s créée pour %s — total: %s XOF", commande.id, user.email, montant_reduit)

        # Envoi email asynchrone (ne bloque pas la transaction)
        try:
            EmailService.envoi_confirmation(commande)
        except Exception as e:
            logger.error("Erreur envoi email confirmation commande %s : %s", commande.id, e)

        return commande


class CommandeTransitionService:
    """Service pour les transitions de statut de commande."""

    TRANSITIONS_VALIDES = {
        StatutCommande.EN_PREPARATION: [
            StatutCommande.EN_LIVRAISON,
            StatutCommande.ANNULEE,
            StatutCommande.EXPIREE,
        ],
        StatutCommande.EN_LIVRAISON: [
            StatutCommande.LIVREE,
            StatutCommande.ANNULEE,
            StatutCommande.EXPIREE,
        ],
    }

    @staticmethod
    @transaction.atomic
    def transitionner(commande: Commande, nouveau_statut: str, user=None):
        """Effectue une transition de statut avec libération de stock si annulation/expiration."""
        # Vérification de la transition
        transitions_possibles = CommandeTransitionService.TRANSITIONS_VALIDES.get(commande.statut, [])
        if nouveau_statut not in transitions_possibles:
            raise ValueError(
                f"Transition invalide de {commande.statut} vers {nouveau_statut}"
            )

        # Libération stock pour annulation ET expiration
        if nouveau_statut in (StatutCommande.ANNULEE, StatutCommande.EXPIREE):
            StockService.liberer(commande.lignes.all())

        commande.statut = nouveau_statut
        if nouveau_statut == StatutCommande.LIVREE:
            commande.date_livraison = timezone.now()
        commande.save()

        logger.info(
            "Commande %s : %s → %s (par %s)",
            commande.id, commande.statut, nouveau_statut,
            user.email if user else "système",
        )

        # Emails selon statut
        try:
            if nouveau_statut == StatutCommande.EXPIREE:
                EmailService.envoi_commande_expiree(commande)
            else:
                EmailService.envoi_changement_statut(commande)
        except Exception as e:
            logger.error("Erreur envoi email transition commande %s : %s", commande.id, e)

        return commande
