from decimal import Decimal
from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.catalog.models import Categorie, Produit, VarianteProduit
from apps.users.models import Adresse
from apps.orders.models import Commande, StatutCommande
from apps.orders.services import CheckoutService, CommandeTransitionService
from apps.orders.tasks import expire_unpaid_orders

User = get_user_model()


class StockExpiry72hTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="client@test.bj",
            password="Pass123456!",
            first_name="Test",
            last_name="Client"
        )
        self.adresse = Adresse.objects.create(
            user=self.user,
            libelle="Maison",
            ville="Cotonou",
            quartier="Haie Vive",
            telephone_contact="+22900000000",
            is_default=True,
        )
        self.cat = Categorie.objects.create(nom="Parfum", type="PARFUM", slug="parfum")
        self.produit = Produit.objects.create(nom="Test", marque="X", categorie=self.cat)
        self.variante = VarianteProduit.objects.create(
            produit=self.produit,
            contenance_ml=50,
            prix=Decimal("15000.00"),
            stock=10,
            sku="SKU-001"
        )

    def test_stock_diminue_a_la_commande(self):
        """Vérifie que le stock diminue lors de la création d'une commande."""
        commande = CheckoutService.creer_commande(
            user=self.user,
            adresse_id=self.adresse.id,
            lignes_data=[{"variante_id": self.variante.id, "quantite": 3}],
        )
        self.variante.refresh_from_db()
        self.assertEqual(self.variante.stock, 7)
        self.assertEqual(commande.statut, StatutCommande.EN_PREPARATION)

    def test_stock_libere_apres_72h(self):
        """Vérifie que le stock est libéré après 72h."""
        commande = CheckoutService.creer_commande(
            user=self.user,
            adresse_id=self.adresse.id,
            lignes_data=[{"variante_id": self.variante.id, "quantite": 3}],
        )
        # Simuler le passage du temps
        Commande.objects.filter(id=commande.id).update(
            date_expiration_stock=timezone.now() - timedelta(hours=1)
        )
        expire_unpaid_orders()
        commande.refresh_from_db()
        self.variante.refresh_from_db()
        self.assertEqual(commande.statut, StatutCommande.EXPIREE)
        self.assertEqual(self.variante.stock, 10)

    def test_stock_pas_libere_avant_72h(self):
        """Vérifie que le stock n'est pas libéré avant 72h."""
        CheckoutService.creer_commande(
            user=self.user,
            adresse_id=self.adresse.id,
            lignes_data=[{"variante_id": self.variante.id, "quantite": 3}],
        )
        expire_unpaid_orders()
        self.variante.refresh_from_db()
        self.assertEqual(self.variante.stock, 7)

    def test_transition_valide(self):
        """Vérifie les transitions de statut valides."""
        commande = CheckoutService.creer_commande(
            user=self.user,
            adresse_id=self.adresse.id,
            lignes_data=[{"variante_id": self.variante.id, "quantite": 1}],
        )
        # EN_PREPARATION → EN_LIVRAISON
        CommandeTransitionService.transitionner(commande, StatutCommande.EN_LIVRAISON)
        commande.refresh_from_db()
        self.assertEqual(commande.statut, StatutCommande.EN_LIVRAISON)
        
        # EN_LIVRAISON → LIVREE
        CommandeTransitionService.transitionner(commande, StatutCommande.LIVREE)
        commande.refresh_from_db()
        self.assertEqual(commande.statut, StatutCommande.LIVREE)
        self.assertIsNotNone(commande.date_livraison)

    def test_transition_invalide(self):
        """Vérifie que les transitions invalides lèvent une erreur."""
        commande = CheckoutService.creer_commande(
            user=self.user,
            adresse_id=self.adresse.id,
            lignes_data=[{"variante_id": self.variante.id, "quantite": 1}],
        )
        with self.assertRaises(ValueError):
            CommandeTransitionService.transitionner(commande, StatutCommande.LIVREE)