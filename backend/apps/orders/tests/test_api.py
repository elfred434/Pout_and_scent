from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.catalog.models import Categorie, Produit, VarianteProduit

User = get_user_model()


class CatalogAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="client@test.bj",
            password="Pass123456!"
        )
        self.admin = User.objects.create_user(
            email="admin@test.bj",
            password="Admin123456!",
            role="ADMIN",
            is_staff=True
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

    def test_list_categories_anonymous(self):
        """Teste que les catégories sont accessibles anonymement."""
        resp = self.client.get("/api/v1/catalog/categories/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_list_products_anonymous(self):
        """Teste que les produits sont accessibles anonymement."""
        resp = self.client.get("/api/v1/catalog/products/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_product_unauthorized(self):
        """Teste qu'un utilisateur non-admin ne peut pas créer de produit."""
        self.client.force_authenticate(user=self.user)
        resp = self.client.post("/api/v1/catalog/products/", {
            "nom": "New Product",
            "marque": "Y",
            "categorie": self.cat.id,
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_product_admin(self):
        """Teste qu'un admin peut créer un produit."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post("/api/v1/catalog/products/", {
            "nom": "New Product",
            "marque": "Y",
            "categorie": self.cat.id,
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)