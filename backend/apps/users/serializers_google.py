# ============================================================
# GOOGLE OAUTH SERIALIZERS
# ============================================================
from rest_framework import serializers


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer pour l'authentification Google"""
    
    credential = serializers.CharField(
        required=True,
        help_text="ID token reçu de Google OAuth"
    )
    
    def validate_credential(self, value):
        if not value or len(value) < 100:
            raise serializers.ValidationError(
                "Le token Google semble invalide (trop court)"
            )
        return value