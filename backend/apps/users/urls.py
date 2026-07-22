from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AdresseViewSet, UserListAPIView, UserDetailAPIView

router = DefaultRouter()
router.register("addresses", AdresseViewSet, basename="address")

urlpatterns = [
    # Admin : liste et détail des utilisateurs
    path("", UserListAPIView.as_view(), name="user-list"),
    path("<uuid:pk>/", UserDetailAPIView.as_view(), name="user-detail"),
    # Adresses
    path("", include(router.urls)),
]
