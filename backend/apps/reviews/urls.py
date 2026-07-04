from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AvisViewSet

router = DefaultRouter()
router.register("", AvisViewSet, basename="avis")

urlpatterns = [path("", include(router.urls))]