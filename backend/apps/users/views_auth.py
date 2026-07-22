import secrets
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


from apps.notifications.services import EmailService
from .serializers import(
    CustomTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)
User = get_user_model()

class RegisterView(generics.CreateAPIView):
    #frère c'est pour l'inscription d'un nouveau client
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
                    "acces": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )
        
class LoginView(APIView):
    #Connexion par email + password
    permission_classes = (AllowAny),
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        return Response({"succes": True, "data": data})
    
class LogoutView(APIView):
    #j'ai oublié
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh = RefreshToken(request.data.get("refresh"))
            refresh.blacklist()
        except Exception:
            pass
        return Response({"success": True, "message": "Déconnecté"})

class  Verify2FAView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"success": False, "message": "Code TOTP requis"}, status=400)
        
        device = TOTPDevice.objects.filter(user=request.user, confirmed=True).first()
        if not device:
            return Response({"success": False, "message": "2FA non configurée"}, status=400)
        
        if not device.verify_token(token):
            return Response({"success": False, "message": "Code invalide"}, status=400)
        
        refresh = RefreshToken.for_user(request.user)
        return Response({
            "success": True,
            "data": {"access": str(refresh.access_token), "refresh": str(refresh)},
        })
        
class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_object(self):
        return self.request.user
    
class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)
    
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
            pass
        
        return Response(
            {"success": True, "message": "Si cet email existe, un lien de réinitialisation a été envoyée"}
            )
        
class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]
        
        user_id = cache.get(f"password_reset_{token}")
        if not user_id:
            return Response(
                {"succes":False, "message": "Lien invalide ou expiré"},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        user = User.objects.get(id=user_id)
        user.set_password(new_password)
        user.save()
        cache.delete(f"password_reset_{token}")
        
        return Response({"success":True, "message": "Mot de passe réinitialisé."})
    
    