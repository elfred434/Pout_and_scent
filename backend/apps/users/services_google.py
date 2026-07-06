# ============================================================
# GOOGLE OAUTH SERVICE — Vérification et échange de tokens
# ============================================================
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()


class GoogleOAuthService:
    """Service pour gérer l'authentification Google OAuth"""

    @staticmethod
    def verify_google_token(id_token_str: str) -> dict:
        """
        Vérifie le token Google et retourne les informations utilisateur
        """
        try:
            client_id = settings.GOOGLE_CLIENT_ID
            
            if not client_id:
                raise AuthenticationFailed(
                    "Google OAuth n'est pas configuré côté serveur"
                )

            # Décoder et vérifier le token
            id_info = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                client_id
            )

            # Vérifier que le token vient bien de Google
            if id_info.get('iss') not in [
                'accounts.google.com',
                'https://accounts.google.com'
            ]:
                raise AuthenticationFailed("Token Google invalide (issuer incorrect)")

            # Extraire les informations
            return {
                'email': id_info.get('email'),
                'google_id': id_info.get('sub'),
                'first_name': id_info.get('given_name', ''),
                'last_name': id_info.get('family_name', ''),
                'picture': id_info.get('picture', ''),
                'email_verified': id_info.get('email_verified', False),
            }

        except ValueError as e:
            raise AuthenticationFailed(f"Token Google invalide: {str(e)}")
        except Exception as e:
            raise AuthenticationFailed(f"Erreur lors de la vérification: {str(e)}")

    @staticmethod
    def get_or_create_user(google_data: dict) -> tuple:
        """
        Récupère ou crée un utilisateur à partir des données Google
        """
        email = google_data.get('email')
        google_id = google_data.get('google_id')

        if not email or not google_id:
            raise AuthenticationFailed("Données Google incomplètes")

        # 1. Essayer de trouver un utilisateur par google_id
        try:
            user = User.objects.get(google_id=google_id)
            return user, False
        except User.DoesNotExist:
            pass

        # 2. Essayer de trouver par email
        try:
            user = User.objects.get(email=email)
            # Lier le google_id au compte existant
            user.google_id = google_id
            user.save(update_fields=['google_id'])
            return user, False
        except User.DoesNotExist:
            pass

        # 3. Créer un nouveau utilisateur
        user = User.objects.create_user(
            email=email,
            first_name=google_data.get('first_name', ''),
            last_name=google_data.get('last_name', ''),
            password=None,  # Pas de mot de passe pour OAuth
            google_id=google_id,
            is_active=True,
        )

        # Définir le rôle par défaut (CLIENT)
        user.role = 'CLIENT'
        user.save(update_fields=['role'])

        return user, True