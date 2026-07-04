from rest_framework import serializers
from .models import Commande, LigneCommande, StatutCommande


# ============================================================
# LIGNE DE COMMANDE
# ============================================================
class LigneCommandeSerializer(serializers.ModelSerializer):
    """Serializer pour une ligne de commande."""
    produit_nom = serializers.CharField(source="variante.produit.nom", read_only=True)
    marque = serializers.CharField(source="variante.produit.marque", read_only=True)
    contenance_ml = serializers.IntegerField(source="variante.contenance_ml", read_only=True)

    class Meta:
        model = LigneCommande
        fields = (
            "id",
            "variante",
            "produit_nom",
            "marque",
            "contenance_ml",
            "quantite",
            "prix_unitaire",
            "sous_total",
        )


# ============================================================
# LISTE DES COMMANDES (léger)
# ============================================================
class CommandeListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des commandes (performances optimisées)."""
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    adresse_libelle = serializers.CharField(source="adresse.libelle", read_only=True)
    nb_articles = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = (
            "id",
            "statut",
            "montant_total",
            "montant_reduit",
            "methode_paiement",
            "adresse_libelle",
            "nb_articles",
            "lignes",
            "created_at",
            "date_livraison",
        )

    def get_nb_articles(self, obj):
        """Retourne le nombre total d'articles dans la commande."""
        return sum(ligne.quantite for ligne in obj.lignes.all())


# ============================================================
# DÉTAIL COMMANDE (complet)
# ============================================================
class CommandeDetailSerializer(serializers.ModelSerializer):
    """Serializer pour le détail d'une commande."""
    lignes = LigneCommandeSerializer(many=True, read_only=True)
    adresse_libelle = serializers.CharField(source="adresse.libelle", read_only=True)
    adresse_complete = serializers.SerializerMethodField()
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Commande
        fields = (
            "id",
            "user_email",
            "statut",
            "montant_total",
            "montant_reduit",
            "methode_paiement",
            "notes_client",
            "notes_admin",
            "adresse",
            "adresse_libelle",
            "adresse_complete",
            "lignes",
            "created_at",
            "date_livraison",
            "date_expiration_stock",
        )

    def get_adresse_complete(self, obj):
        """Construit l'adresse complète formatée."""
        a = obj.adresse
        return f"{a.quartier}, {a.ville} — Tél: {a.telephone_contact}"


# ============================================================
# CHECKOUT (création de commande)
# ============================================================
class CheckoutLigneSerializer(serializers.Serializer):
    """Serializer pour une ligne du checkout."""
    variante_id = serializers.UUIDField()
    quantite = serializers.IntegerField(min_value=1, max_value=100)

    def validate_quantite(self, value):
        if value <= 0:
            raise serializers.ValidationError("La quantité doit être supérieure à 0.")
        return value


class CheckoutSerializer(serializers.Serializer):
    """Serializer pour le checkout (création de commande)."""
    adresse_id = serializers.UUIDField()
    lignes = CheckoutLigneSerializer(many=True, min_length=1)
    notes_client = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
    )

    def validate_lignes(self, value):
        if not value:
            raise serializers.ValidationError("Au moins un article est requis.")
        return value


# ============================================================
# TRANSITION DE STATUT (admin)
# ============================================================
class TransitionSerializer(serializers.Serializer):
    """Serializer pour changer le statut d'une commande."""
    statut = serializers.ChoiceField(choices=[
        StatutCommande.EN_LIVRAISON,
        StatutCommande.LIVREE,
        StatutCommande.ANNULEE,
    ])