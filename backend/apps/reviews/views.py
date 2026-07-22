from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Avis
from .serializers import AvisSerializer
from apps.common.exceptions import BusinessError


class AvisViewSet(viewsets.ModelViewSet):
    """CRUD des avis."""
    serializer_class = AvisSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['produit', 'note']
    search_fields = ['commentaire', 'user__email']
    ordering_fields = ['created_at', 'note']

    def get_queryset(self):
        # Admin voit tout (y compris masqués) pour pouvoir modérer
        if self.action in ("list",):
            return Avis.objects.filter(is_visible=True).select_related("user", "produit")
        return Avis.objects.all().select_related("user", "produit")

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticatedOrReadOnly()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        """Validation métier : un client ne peut laisser qu'un seul avis par produit."""
        produit = serializer.validated_data["produit"]
        user = self.request.user

        if Avis.objects.filter(produit=produit, user=user).exists():
            raise BusinessError("Vous avez déjà laissé un avis pour ce produit.")

        serializer.save(user=user)
        self._recalculer_note(serializer.instance.produit)

    def perform_update(self, serializer):
        avis = self.get_object()
        if self.request.user.role != "ADMIN" and avis.user != self.request.user:
            raise BusinessError("Vous ne pouvez modifier que vos propres avis.", status_code=403)
        serializer.save()
        self._recalculer_note(avis.produit)

    def perform_destroy(self, instance):
        """Suppression soft."""
        instance.is_visible = False
        instance.save(update_fields=["is_visible"])
        self._recalculer_note(instance.produit)

    @staticmethod
    def _recalculer_note(produit):
        from django.db.models import Avg, Count
        stats = Avis.objects.filter(produit=produit, is_visible=True).aggregate(
            avg=Avg("note"),
            count=Count("id")
        )
        produit.note_moyenne = stats["avg"] or 0
        produit.nb_avis = stats["count"]
        produit.save(update_fields=["note_moyenne", "nb_avis"])
