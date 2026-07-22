from rest_framework import serializers
from .models import User


class UserListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des utilisateurs (admin uniquement)."""
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            "id", "email", "first_name", "last_name", "full_name",
            "role", "is_active", "is_2fa_enabled", "date_joined",
        )
        read_only_fields = fields


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer pour le détail d'un utilisateur (admin)."""
    full_name = serializers.ReadOnlyField()
    nb_adresses = serializers.SerializerMethodField()
    nb_commandes = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "email", "first_name", "last_name", "full_name",
            "role", "is_active", "is_2fa_enabled", "is_staff",
            "google_id", "date_joined", "last_login",
            "nb_adresses", "nb_commandes",
        )
        read_only_fields = fields

    def get_nb_adresses(self, obj):
        return obj.adresses.count()

    def get_nb_commandes(self, obj):
        return obj.commandes.count()
