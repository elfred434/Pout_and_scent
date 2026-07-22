import logging
import secrets

from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice

from .serializers import (
    CustomTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)
from apps.notifications.services import EmailService

logger = logging.getLogger(__name__)
User = get_user_model()


# ============================================================
# THROTTLES PERSONNALISÉS
# ============================================================
class AuthRateThrottle(AnonRateThrottle):
    """Rate limit pour les endpoints d'authentification : 10 req/min."""
    rate = "10/min"


class PasswordResetThrottle(AnonRateThrottle):
    """Rate limit pour le reset de mot de passe : 5 req/heure."""
    rate = "5/hour"


# ============================================================
# VIEWS
# ============================================================
class RegisterView(generics.CreateAPIView):
    """Inscription d'un nouveau client."""
    queryset = User.objects.filter(role="CLIENT")
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    throttle_classes = [AuthRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        logger.info("Nouvel utilisateur inscrit : %s", user.email)

        return Response(
            {
                "success": True,
                "data": {
                    "user": UserSerializer(user).data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Connexion par email + password."""
    permission_classes = (AllowAny,)
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        return Response({
            "success": True,
            "data": data,
        })


class LogoutView(APIView):
    """Déconnexion — blackliste le refresh token."""
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            refresh = RefreshToken(refresh_token)
            refresh.blacklist()
            logger.info("Déconnexion réussie pour %s", request.user.email)
        except Exception as e:
            logger.warning("Token de rafraîchissement invalide lors de la déconnexion : %s", e)

        return Response({"success": True, "message": "Déconnecté"})


class Verify2FAView(APIView):
    """Vérification du code TOTP 2FA."""
    permission_classes = (IsAuthenticated,)
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"success": False, "message": "Code TOTP requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        device = TOTPDevice.objects.filter(user=request.user, confirmed=True).first()
        if not device:
            return Response(
                {"success": False, "message": "2FA non configurée"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not device.verify_token(token):
            logger.warning("Code 2FA invalide pour %s", request.user.email)
            return Response(
                {"success": False, "message": "Code invalide"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refresh = RefreshToken.for_user(request.user)
        logger.info("2FA vérifiée pour %s", request.user.email)

        return Response({
            "success": True,
            "data": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        })


class MeView(generics.RetrieveUpdateAPIView):
    """Profil de l'utilisateur connecté."""
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    """Demande de réinitialisation de mot de passe par email."""
    permission_classes = (AllowAny,)
    serializer_class = PasswordResetRequestSerializer
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
            token = secrets.token_urlsafe(32)
            cache.set(f"password_reset_{token}", str(user.id), timeout=3600)
            EmailService.envoi_reset_password(email=email, token=token)
            logger.info("Demande de reset de mot de passe pour %s", email)
        except User.DoesNotExist:
            # Ne pas révéler si l'email existe (sécurité)
            pass

        return Response({
            "success": True,
            "message": "Si cet email existe, un lien de réinitialisation a été envoyé",
        })


class PasswordResetConfirmView(APIView):
    """Confirmation de la réinitialisation de mot de passe."""
    permission_classes = (AllowAny,)
    serializer_class = PasswordResetConfirmSerializer
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        user_id = cache.get(f"password_reset_{token}")
        if not user_id:
            return Response(
                {"success": False, "message": "Lien invalide ou expiré"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
            user.set_password(new_password)
            user.save()
            cache.delete(f"password_reset_{token}")
            logger.info("Mot de passe réinitialisé pour %s", user.email)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "Lien invalide"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "success": True,
            "message": "Mot de passe réinitialisé.",
        })
