from rest_framework import serializers
from .models import Categorie, Produit, ProduitImage, VarianteProduit
from apps.promotions.services import PricingService


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ("id", "nom", "type", "slug", "description", "image", "is_active")


class ProduitImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProduitImage
        fields = ("id", "image", "ordre", "is_primary")


class VarianteProduitSerializer(serializers.ModelSerializer):
    prix_final = serializers.SerializerMethodField()

    class Meta:
        model = VarianteProduit
        fields = ("id", "contenance_ml", "prix", "prix_final", "stock", "sku", "is_active")

    def get_prix_final(self, obj) -> str:
        return str(PricingService.prix_final(obj))


class ProduitListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des produits (performances optimisées)."""
    categorie = CategorieSerializer(read_only=True)
    images = ProduitImageSerializer(many=True, read_only=True)
    variantes = VarianteProduitSerializer(many=True, read_only=True)
    prix_min = serializers.SerializerMethodField()

    class Meta:
        model = Produit
        fields = (
            "id",
            "nom",
            "marque",
            "categorie",
            "note_moyenne",
            "nb_avis",
            "is_featured",
            "is_active",
            "images",
            "variantes",
            "prix_min",
            "created_at",
        )

    def get_prix_min(self, obj) -> str | None:
        """Retourne le prix minimum parmi les variantes actives."""
        variantes = getattr(obj, "variantes_actives_triees", None)
        if variantes and len(variantes) > 0:
            return str(variantes[0].prix)
        return None


class ProduitDetailSerializer(serializers.ModelSerializer):
    """Serializer pour le détail d'un produit."""
    categorie = CategorieSerializer(read_only=True)
    variantes = VarianteProduitSerializer(many=True, read_only=True)
    images = ProduitImageSerializer(many=True, read_only=True)

    class Meta:
        model = Produit
        fields = (
            "id",
            "nom",
            "marque",
            "description",
            "categorie",
            "slug",
            "note_moyenne",
            "nb_avis",
            "is_featured",
            "is_active",
            "variantes",
            "images",
            "created_at",
            "updated_at",
        )