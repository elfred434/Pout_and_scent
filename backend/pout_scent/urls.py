from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    # path("api/auth/", include("apps.users.urls_auth")),
    # path("api/v1/users/", include("apps.users.urls")),
    # path("api/v1/catalog/", include("apps.catalog.urls")),
    # path("api/v1/orders/", include("apps.orders.urls")),
    # path("api/v1/promotions/", include("apps.promotions.urls")),
    # path("api/v1/reviews/", include("apps.reviews.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    try:
        import debug_toolbar
        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass