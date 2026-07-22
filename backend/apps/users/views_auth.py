from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.cache import cache
import secrets

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

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Inscription d'un nouveau client."""
    queryset = User.objects.filter(role="CLIENT")
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response(
            {
                "success": True,
                "data": {
                    "user": UserSerializer(user).data,
                    "access": str(refresh.access_token),  # ✅ CORRIGÉ : "acces" → "access"
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Connexion par email + password."""
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        return Response({
            "success": True,  # ✅ CORRIGÉ : "succes" → "success"
            "data": data
        })


class LogoutView(APIView):
    """Déconnexion — blackliste le refresh token."""
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.Serializer

    def post(self, request):
        try:
            refresh = RefreshToken(request.data.get("refresh"))
            refresh.blacklist()
        except Exception:
            pass
        return Response({"success": True, "message": "Déconnecté"})


class Verify2FAView(APIView):
    """Vérification du code TOTP 2FA."""
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.Serializer

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"success": False, "message": "Code TOTP requis"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        device = TOTPDevice.objects.filter(user=request.user, confirmed=True).first()
        if not device:
            return Response(
                {"success": False, "message": "2FA non configurée"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not device.verify_token(token):
            return Response(
                {"success": False, "message": "Code invalide"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        refresh = RefreshToken.for_user(request.user)
        return Response({
            "success": True,
            "data": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
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

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
            token = secrets.token_urlsafe(32)
            cache.set(f"password_reset_{token}", str(user.id), timeout=3600)
            EmailService.envoi_reset_password(email=email, token=token)
        except User.DoesNotExist:
            pass  # Sécurité : ne pas révéler si l'email existe
        
        return Response(
            {
                "success": True,
                "message": "Si cet email existe, un lien de réinitialisation a été envoyé"
            }
        )


class PasswordResetConfirmView(APIView):
    """Confirmation de la réinitialisation de mot de passe."""
    permission_classes = (AllowAny,)
    serializer_class = PasswordResetConfirmSerializer  # ✅ CORRIGÉ : était PasswordResetRequestSerializer

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        user_id = cache.get(f"password_reset_{token}")
        if not user_id:
            return Response(
                {"success": False, "message": "Lien invalide ou expiré"},  # ✅ CORRIGÉ
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        user = User.objects.get(id=user_id)
        user.set_password(new_password)
        user.save()
        cache.delete(f"password_reset_{token}")
        
        return Response({
            "success": True,  # ✅ CORRIGÉ : "succes" → "success"
            "message": "Mot de passe réinitialisé."
        })