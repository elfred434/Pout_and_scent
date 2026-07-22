from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Adresse, User
from .serializers_adresse import AdresseSerializer
from .serializers_user import UserListSerializer, UserDetailSerializer
from .permissions import IsOwnerOrAdmin, IsAdminRole


class AdresseViewSet(viewsets.ModelViewSet):
    """CRUD des adresses de l'utilisateur connecté."""
    serializer_class = AdresseSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        return Adresse.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserListAPIView(generics.ListAPIView):
    """
    Liste de tous les utilisateurs (admin uniquement).
    GET /api/v1/users/
    """
    serializer_class = UserListSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["email", "first_name", "last_name"]
    ordering_fields = ["date_joined", "email", "role"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role.upper())
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        return qs


class UserDetailAPIView(generics.RetrieveUpdateAPIView):
    """
    Détail d'un utilisateur (admin uniquement).
    GET/PATCH /api/v1/users/{id}/
    """
    serializer_class = UserDetailSerializer
    permission_classes = [IsAdminRole]
    queryset = User.objects.all()
    lookup_field = "pk"
