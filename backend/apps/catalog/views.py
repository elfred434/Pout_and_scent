import logging

from django.db.models import Min, Prefetch
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from rest_framework import viewsets, filters, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Categorie, Produit, VarianteProduit, SignalementEffetIndesirable
from .serializers import (
    CategorieSerializer,
    ProduitListSerializer,
    ProduitDetailSerializer,
    SignalementEffetIndesirableSerializer,
)
from apps.users.permissions import IsAdminRole

logger = logging.getLogger(__name__)


class CategorieViewSet(viewsets.ModelViewSet):
    """CRUD des catégories. Lecture publique, écriture admin uniquement."""
    queryset = Categorie.objects.filter(is_active=True)
    serializer_class = CategorieSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nom"]
    ordering_fields = ["nom", "created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminRole()]

    @method_decorator(cache_page(60 * 60))  # Cache 1h pour la liste
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        categorie = serializer.save()
        logger.info("Catégorie créée : %s (par %s)", categorie.nom, self.request.user.email)

    def perform_update(self, serializer):
        categorie = serializer.save()
        logger.info("Catégorie mise à jour : %s (par %s)", categorie.nom, self.request.user.email)

    def perform_destroy(self, instance):
        # Soft delete : désactiver au lieu de supprimer
        instance.is_active = False
        instance.save()
        logger.info("Catégorie désactivée : %s (par %s)", instance.nom, self.request.user.email)


class ProduitViewSet(viewsets.ModelViewSet):
    """CRUD des produits. Lecture publique, écriture admin uniquement."""
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["categorie_id", "marque", "is_featured"]
    search_fields = ["nom", "marque", "description"]
    ordering_fields = ["prix_min", "note_moyenne", "created_at", "nb_avis"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminRole()]

    def get_queryset(self):
        qs = Produit.objects.filter(is_active=True)

        qs = qs.select_related("categorie").prefetch_related(
            "images",
            Prefetch(
                "variantes",
                queryset=VarianteProduit.objects.filter(is_active=True).order_by("prix"),
                to_attr="variantes_actives_triees",
            ),
        )

        # Annotation du prix minimal pour tri/filtre
        qs = qs.annotate(prix_min=Min("variantes__prix"))

        # Filtres prix
        filtre_prix_min = self.request.query_params.get("prix_min")
        filtre_prix_max = self.request.query_params.get("prix_max")
        if filtre_prix_min:
            qs = qs.filter(prix_min__gte=filtre_prix_min)
        if filtre_prix_max:
            qs = qs.filter(prix_min__lte=filtre_prix_max)

        # Filtre contenance
        contenance = self.request.query_params.get("contenance")
        if contenance:
            qs = qs.filter(
                variantes__contenance_ml=contenance,
                variantes__is_active=True,
            ).distinct()

        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProduitDetailSerializer
        return ProduitListSerializer

    @method_decorator(cache_page(60 * 15))  # Cache 15min pour la liste
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        produit = serializer.save()
        logger.info("Produit créé : %s (par %s)", produit.nom, self.request.user.email)

    def perform_update(self, serializer):
        produit = serializer.save()
        logger.info("Produit mis à jour : %s (par %s)", produit.nom, self.request.user.email)

    def perform_destroy(self, instance):
        # Soft delete : désactiver au lieu de supprimer
        instance.is_active = False
        instance.save()
        logger.info("Produit désactivé : %s (par %s)", instance.nom, self.request.user.email)


# ─── SIGNALEMENT EFFETS INDÉSIRABLES (Obligation ABMed) ─────
class SignalementEffetIndesirableView(generics.CreateAPIView):
    """
    Endpoint public pour signaler un effet indésirable d'un produit cosmétique.
    Obligation réglementaire ABMed — Arrêté du 18/01/2022.
    """
    serializer_class = SignalementEffetIndesirableSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        signalement = serializer.save()

        logger.info(
            "Signalement effet indésirable reçu : produit='%s', gravité=%s, email=%s",
            signalement.nom_produit_signale,
            signalement.gravite,
            signalement.email_signalant,
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Votre signalement a été enregistré. "
                    "Il sera examiné par notre équipe et transmis à l'ABMed si nécessaire. "
                    "Merci pour votre vigilance."
                ),
                "data": {
                    "id": str(signalement.id),
                    "statut": signalement.statut,
                },
            },
            status=status.HTTP_201_CREATED,
        )
