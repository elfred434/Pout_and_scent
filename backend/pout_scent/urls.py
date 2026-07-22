from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # Documentation API
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    
    # Auth & Users (J3)
    path("api/auth/", include("apps.users.urls_auth")),
    path("api/v1/users/", include("apps.users.urls")),
    
    # Catalog, Promos, Reviews (J4)
    path("api/v1/catalog/", include("apps.catalog.urls")),
    path("api/v1/promotions/", include("apps.promotions.urls")),
    path("api/v1/reviews/", include("apps.reviews.urls")),
    
    # ✅ ORDERS (J5)
    path("api/v1/orders/", include("apps.orders.urls")),
    
    # 💬 CHAT (J6)
    path("api/v1/chat/", include("apps.chat.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    try:
        import debug_toolbar
        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass