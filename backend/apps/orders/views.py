from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsAdminRole
from .models import Commande
from .serializers import (
    CommandeListSerializer,
    CommandeDetailSerializer,
    CheckoutSerializer,
    TransitionSerializer,
)
from .services import CheckoutService, CommandeTransitionService


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Liste et détail des commandes.
    - Client : voit uniquement ses propres commandes
    - Admin : voit toutes les commandes
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CommandeListSerializer  # ✅ Serializer par défaut

    def get_queryset(self):
        qs = Commande.objects.select_related(
            "user", "adresse"
        ).prefetch_related(
            "lignes__variante__produit"
        ).order_by("-created_at")

        # Si l'utilisateur n'est pas admin, il ne voit que ses commandes
        if not self.request.user.role == "ADMIN":
            qs = qs.filter(user=self.request.user)

        return qs

    def get_serializer_class(self):
        """Retourne le bon serializer selon l'action."""
        if self.action == "retrieve":
            return CommandeDetailSerializer
        return CommandeListSerializer

    @action(detail=False, methods=["post"], url_path="checkout")
    def checkout(self, request):
        """Créer une commande avec réservation de stock."""
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            commande = CheckoutService.creer_commande(
                user=request.user,
                adresse_id=serializer.validated_data["adresse_id"],
                lignes_data=serializer.validated_data["lignes"],
                notes_client=serializer.validated_data.get("notes_client", ""),
            )
            return Response(
                CommandeDetailSerializer(commande).data,
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"], url_path="transition")
    def transition(self, request, pk=None):
        """Changer le statut d'une commande (admin uniquement)."""
        if not IsAdminRole().has_permission(request, self):
            return Response(
                {"error": "Permission refusée"},
                status=status.HTTP_403_FORBIDDEN,
            )

        commande = self.get_object()
        serializer = TransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            commande = CommandeTransitionService.transitionner(
                commande=commande,
                nouveau_statut=serializer.validated_data["statut"],
                user=request.user,
            )
            return Response(CommandeDetailSerializer(commande).data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        """Annuler une commande."""
        commande = self.get_object()

        # Vérification des permissions
        is_admin = request.user.role == "ADMIN"
        is_owner = commande.user == request.user

        if not (is_admin or (is_owner and commande.statut == "EN_PREPARATION")):
            return Response(
                {"error": "Permission refusée"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            commande = CommandeTransitionService.transitionner(
                commande=commande,
                nouveau_statut="ANNULEE",
                user=request.user,
            )
            return Response(CommandeDetailSerializer(commande).data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )