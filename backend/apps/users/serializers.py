from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "password", "password_confirm")

    def validate(self, attrs):
        # Vérifier que les mots de passe correspondent
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Les mots de passe ne correspondent pas."})
        
        # Supprimer password_confirm des données validées
        attrs.pop("password_confirm")
        
        return attrs

    def create(self, validated_data):
        # password_confirm a déjà été retiré dans validate()
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role", "is_2fa_enabled", "created_at")
        read_only_fields = ("id", "email", "role", "is_2fa_enabled", "created_at")


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data

        # Si admin avec 2FA activée, on ne délivre pas le token tout de suite
        if self.user.role == "ADMIN" and self.user.is_2fa_enabled:
            from django_otp.plugins.otp_totp.models import TOTPDevice
            device = TOTPDevice.objects.filter(user=self.user, confirmed=True).first()
            if device:
                from rest_framework_simplejwt.tokens import AccessToken
                from datetime import timedelta
                temp = AccessToken()
                temp["user_id"] = str(self.user.id)
                temp["temp"] = True
                temp.set_exp(lifetime=timedelta(minutes=5))
                return {"temp_token": str(temp), "requires_2fa": True}
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField()