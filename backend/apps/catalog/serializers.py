from rest_framework import serializers
from .models import (
    Categorie,
    Produit,
    ProduitImage,
    VarianteProduit,
    SignalementEffetIndesirable,
)
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
    categorie_id = serializers.PrimaryKeyRelatedField(
        queryset=Categorie.objects.all(),
        source="categorie",
        write_only=True,
        required=False,
    )
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
            "categorie_id",
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


class ProduitWriteSerializer(serializers.ModelSerializer):
    """Serializer pour la création/modification des produits."""
    categorie_id = serializers.PrimaryKeyRelatedField(
        queryset=Categorie.objects.all(),
        source="categorie",
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )
    variantes = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        write_only=True,
        default=[],
    )

    class Meta:
        model = Produit
        fields = (
            "id",
            "nom",
            "marque",
            "description",
            "categorie_id",
            "is_featured",
            "is_active",
            "amm_number",
            "liste_inci",
            "pays_origine",
            "date_peremption",
            "numero_lot",
            "variantes",
        )
        read_only_fields = ("id",)
        extra_kwargs = {
            "amm_number": {"required": False, "allow_blank": True},
            "liste_inci": {"required": False, "allow_blank": True},
            "pays_origine": {"required": False, "allow_blank": True},
            "numero_lot": {"required": False, "allow_blank": True},
            "date_peremption": {"required": False, "allow_null": True},
            "is_active": {"required": False},
            "is_featured": {"required": False},
        }

    def create(self, validated_data):
        variantes_data = validated_data.pop("variantes", [])
        produit = Produit.objects.create(**validated_data)
        for var_data in variantes_data:
            VarianteProduit.objects.create(produit=produit, **var_data)
        return produit

    def update(self, instance, validated_data):
        variantes_data = validated_data.pop("variantes", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if variantes_data is not None:
            # Mettre à jour les variantes existantes par contenance,
            # créer les nouvelles, désactiver les anciennes
            existing = {v.contenance_ml: v for v in instance.variantes.all()}
            new_contenances = set()

            for var_data in variantes_data:
                contenance = var_data["contenance_ml"]
                new_contenances.add(contenance)

                if contenance in existing:
                    # Mettre à jour la variante existante
                    v = existing[contenance]
                    v.prix = var_data.get("prix", v.prix)
                    v.stock = var_data.get("stock", v.stock)
                    v.is_active = True
                    v.save()
                else:
                    # Créer une nouvelle variante
                    VarianteProduit.objects.create(produit=instance, **var_data)

            # Désactiver (pas supprimer) les variantes qui ne sont plus dans la liste
            for contenance, v in existing.items():
                if contenance not in new_contenances:
                    v.is_active = False
                    v.save(update_fields=["is_active"])

        return instance


class VarianteProduitWriteSerializer(serializers.ModelSerializer):
    """Serializer pour créer/modifier une variante individuellement."""
    class Meta:
        model = VarianteProduit
        fields = ("id", "produit", "contenance_ml", "prix", "stock", "sku", "is_active")
        read_only_fields = ("id", "sku")
        extra_kwargs = {
            "stock": {"required": False},
            "is_active": {"required": False},
        }


class ProduitImageWriteSerializer(serializers.ModelSerializer):
    """Serializer pour upload d'images produit."""
    class Meta:
        model = ProduitImage
        fields = ("id", "produit", "image", "ordre", "is_primary")
        read_only_fields = ("id",)


class ProduitDetailSerializer(serializers.ModelSerializer):
    """
    Serializer pour le détail d'un produit.
    Inclut les champs réglementaires ABMed (Arrêté du 18/01/2022).
    """
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
            # ─── Champs réglementaires ABMed ───
            "amm_number",
            "liste_inci",
            "pays_origine",
            "date_peremption",
            "numero_lot",
            "created_at",
            "updated_at",
        )


# ─── SERIALIZER SIGNALEMENT EFFETS INDÉSIRABLES ─────────────
class SignalementEffetIndesirableSerializer(serializers.ModelSerializer):
    """
    Serializer pour le signalement d'effets indésirables.
    Obligation réglementaire ABMed.
    """
    class Meta:
        model = SignalementEffetIndesirable
        fields = (
            "id",
            "produit",
            "nom_produit_signale",
            "email_signalant",
            "telephone_signalant",
            "description",
            "gravite",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_description(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError(
                "La description doit contenir au moins 20 caractères."
            )
        return value

    def validate(self, attrs):
        # Au moins un produit (catalogue ou nom libre) doit être renseigné
        if not attrs.get("produit") and not attrs.get("nom_produit_signale"):
            raise serializers.ValidationError(
                "Veuillez indiquer le produit concerné."
            )
        return attrs
