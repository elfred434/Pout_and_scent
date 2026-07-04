from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_client(self):
        """Teste l'inscription d'un client."""
        resp = self.client.post("/api/auth/register/", {
            "email": "new@test.bj",
            "first_name": "New",
            "last_name": "User",
            "password": "StrongPass123!",
            "password_confirm": "StrongPass123!",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="new@test.bj").exists())

    def test_login_email(self):
        """Teste la connexion par email."""
        User.objects.create_user(email="a@test.bj", password="Pass123456!")
        resp = self.client.post("/api/auth/login/", {
            "email": "a@test.bj",
            "password": "Pass123456!"
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.json()["data"])
        self.assertIn("refresh", resp.json()["data"])

    def test_register_password_mismatch(self):
        """Teste que les mots de passe différents sont rejetés."""
        resp = self.client.post("/api/auth/register/", {
            "email": "test@test.bj",
            "password": "Pass123456!",
            "password_confirm": "DifferentPass!",
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_invalid_credentials(self):
        """Teste la connexion avec des identifiants invalides."""
        resp = self.client.post("/api/auth/login/", {
            "email": "nonexistent@test.bj",
            "password": "WrongPass!"
        })
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)