from rest_framework import serializers
from django.utils import timezone
from .models import Promotion


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = (
            "id", "nom", "produit", "categorie", "type", "valeur",
            "date_debut", "date_fin", "code", "is_active"
        )

    def validate(self, attrs):
        date_debut = attrs.get("date_debut", getattr(self.instance, "date_debut", None))
        date_fin = attrs.get("date_fin", getattr(self.instance, "date_fin", None))

        if date_debut and date_fin and date_fin < date_debut:
            raise serializers.ValidationError(
                {"date_fin": "La date de fin doit être postérieure à la date de début."}
            )

        produit = attrs.get("produit", getattr(self.instance, "produit", None))
        categorie = attrs.get("categorie", getattr(self.instance, "categorie", None))

        if not produit and not categorie:
            raise serializers.ValidationError(
                "Une promotion doit cibler un produit ou une catégorie."
            )

        type_promo = attrs.get("type", getattr(self.instance, "type", None))
        valeur = attrs.get("valeur", getattr(self.instance, "valeur", None))

        if type_promo == "POURCENTAGE" and valeur is not None and not (0 < valeur <= 100):
            raise serializers.ValidationError(
                {"valeur": "Le pourcentage doit être entre 0 et 100."}
            )

        return attrs
