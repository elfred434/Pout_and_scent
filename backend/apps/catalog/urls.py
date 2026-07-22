from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import CategorieViewSet, ProduitViewSet, SignalementEffetIndesirableView

router = DefaultRouter()
router.register("categories", CategorieViewSet, basename="categorie")
router.register("products", ProduitViewSet, basename="product")

urlpatterns = [
    path("", include(router.urls)),
    # Signalement effets indésirables — Obligation ABMed
    path(
        "signalement/",
        SignalementEffetIndesirableView.as_view(),
        name="signalement-effet-indesirable",
    ),
]
