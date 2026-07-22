from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AdresseViewSet

router = DefaultRouter()
router.register("addresses", AdresseViewSet, basename="address")

urlpatterns = [path("", include(router.urls))]