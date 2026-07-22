from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Promotion
from .serializers import PromotionSerializer
from apps.users.permissions import IsAdminRole


class PromotionViewSet(viewsets.ModelViewSet):
    """CRUD des promotions. Lecture publique, écriture admin uniquement."""
    queryset = Promotion.objects.filter(is_active=True)
    serializer_class = PromotionSerializer
    filter_backends = [DjangoFilterBackend]  # ✅ CLASSE, pas string
    filterset_fields = ["type", "produit_id", "categorie_id"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminRole()]