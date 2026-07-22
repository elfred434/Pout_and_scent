from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Promotion
from .serializers import PromotionSerializer
from apps.users.permissions import IsAdminRole


class PromotionViewSet(viewsets.ModelViewSet):
    """CRUD des promotions. Lecture publique, écriture admin uniquement."""
    serializer_class = PromotionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["type", "produit_id", "categorie_id"]

    def get_queryset(self):
        if self.action in ("list",):
            return Promotion.objects.filter(is_active=True)
        return Promotion.objects.all()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminRole()]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
