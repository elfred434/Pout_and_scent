from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers_google import GoogleAuthSerializer
from .services_google import GoogleOAuthService


class GoogleAuthView(APIView):
    """
    Endpoint pour l'authentification Google OAuth
    """
    
    # ✅ CRITIQUE : Doit être AllowAny
    permission_classes = [AllowAny]
    authentication_classes = []  # ✅ Désactiver l'authentification
    
    serializer_class = GoogleAuthSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        credential = serializer.validated_data['credential']

        # 1. Vérifier le token Google
        google_data = GoogleOAuthService.verify_google_token(credential)

        # 2. Récupérer ou créer l'utilisateur
        user, created = GoogleOAuthService.get_or_create_user(google_data)

        # 3. Générer les tokens JWT
        refresh = RefreshToken.for_user(user)

        # 4. Préparer la réponse
        user_data = {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_2fa_enabled': user.is_2fa_enabled,
        }

        response_data = {
            'success': True,
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
            },
            'message': 'Connexion Google réussie' if not created else 'Compte créé avec succès',
        }

        return Response(response_data, status=status.HTTP_200_OK)