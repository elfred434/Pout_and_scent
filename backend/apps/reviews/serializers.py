from rest_framework import serializers
from .models import Avis


class AvisSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    produit_nom = serializers.CharField(source="produit.nom", read_only=True)

    class Meta:
        model = Avis
        fields = (
            "id", "produit", "produit_nom", "user_email", "note",
            "commentaire", "is_visible", "created_at"
        )
        read_only_fields = ("id", "user_email", "produit_nom", "is_visible", "created_at")