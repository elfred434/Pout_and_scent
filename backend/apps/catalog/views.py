from django.db.models import Min, Prefetch
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Categorie, Produit, VarianteProduit
from .serializers import (
    CategorieSerializer,
    ProduitListSerializer,
    ProduitDetailSerializer,
)
from apps.users.permissions import IsAdminRole


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


class ProduitViewSet(viewsets.ModelViewSet):
    """CRUD des produits. Lecture publique, écriture admin uniquement."""
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["categorie_id", "marque", "is_featured"]
    search_fields = ["nom", "marque", "description"]
    ordering_fields = ["prix_min", "note_moyenne", "created_at", "nb_avis"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Produit.objects.filter(is_active=True)

        # ✅ OPTIMISATION : select_related + prefetch_related avec to_attr
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
                variantes__is_active=True
            ).distinct()

        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProduitDetailSerializer
        return ProduitListSerializer

    @method_decorator(cache_page(60 * 15))  # Cache 15min pour la liste
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)