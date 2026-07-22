from rest_framework import serializers
from .models import Promotion


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = (
            "id", "nom", "produit", "categorie", "type", "valeur",
            "date_debut", "date_fin", "code", "is_active"
        )