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
from .models import Commande, LigneCommande


class StockService:
    @staticmethod
    @transaction.atomic
    def reserver(lignes_data: list[dict]):
        """lignes_data = [{'variante_id': uuid, 'quantite': int}, ...]"""
        ids = [l["variante_id"] for l in lignes_data]
        variantes = {
            str(v.id): v
            for v in VarianteProduit.objects.select_for_update().filter(id__in=ids)
        }
        for ligne in lignes_data:
            v = variantes.get(str(ligne["variante_id"]))
            if not v:
                raise ValueError(f"Variante {ligne['variante_id']} introuvable")
            if not v.is_active:
                raise ValueError(f"Variante {v.sku} inactive")
            if v.stock < ligne["quantite"]:
                raise ValueError(f"Stock insuffisant pour {v.sku} (dispo: {v.stock})")
            updated = VarianteProduit.objects.filter(id=v.id, stock__gte=ligne["quantite"]).update(
                stock=F("stock") - ligne["quantite"]
            )
            if not updated:
                raise ValueError(f"Stock insuffisant pour {v.sku} (concurrence)")
            v.refresh_from_db()

    @staticmethod
    @transaction.atomic
    def liberer(lignes):
        for ligne in lignes:
            VarianteProduit.objects.filter(id=ligne.variante_id).update(
                stock=F("stock") + ligne.quantite
            )


class CheckoutService:
    @staticmethod
    @transaction.atomic
    def creer_commande(user, adresse_id, lignes_data: list[dict], notes_client=""):
        adresse = Adresse.objects.get(id=adresse_id, user=user)

        ids = [l["variante_id"] for l in lignes_data]
        variantes_map = {
            str(v.id): v
            for v in VarianteProduit.objects.filter(id__in=ids)
        }

        StockService.reserver(lignes_data)

        montant_total = Decimal("0")
        montant_reduit = Decimal("0")
        lignes_objs = []
        for ligne in lignes_data:
            variante = variantes_map[str(ligne["variante_id"])]
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

        EmailService.envoi_confirmation(commande)
        return commande