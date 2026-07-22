from rest_framework import viewsets
from .models import Adresse
from .serializers_adresse import AdresseSerializer
from .permissions import IsOwnerOrAdmin


class AdresseViewSet(viewsets.ModelViewSet):
    """CRUD des adresses de l'utilisateur connecté."""
    serializer_class = AdresseSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        return Adresse.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)