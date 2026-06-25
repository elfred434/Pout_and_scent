from django.contrib import admin
from .models import Avis


@admin.register(Avis)
class AvisAdmin(admin.ModelAdmin):
    list_display = ("produit", "user", "note", "is_visible", "created_at")
    list_filter = ("note", "is_visible")
    search_fields = ("produit__nom", "user__email", "commentaire")
    actions = ["approuver", "masquer"]

    @admin.action(description="Approuver (visible)")
    def approuver(self, request, queryset):
        queryset.update(is_visible=True)

    @admin.action(description="Masquer")
    def masquer(self, request, queryset):
        queryset.update(is_visible=False)