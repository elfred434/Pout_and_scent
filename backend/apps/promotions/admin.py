from django.contrib import admin
from .models import Promotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ("nom", "type", "valeur", "date_debut", "date_fin", "is_active", "created_at")
    list_filter = ("type", "is_active", "date_debut", "date_fin")
    search_fields = ("nom", "code", "produit__nom", "categorie__nom")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("is_active",)
    
    fieldsets = (
        (None, {"fields": ("nom", "code")}),
        ("Type de réduction", {"fields": ("type", "valeur")}),
        ("Cible", {"fields": ("produit", "categorie")}),
        ("Période", {"fields": ("date_debut", "date_fin", "is_active")}),
        ("Dates système", {"fields": ("created_at", "updated_at")}),
    )
    
    actions = ["activate", "deactivate"]
    
    @admin.action(description="Activer les promotions sélectionnées")
    def activate(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} promotion(s) activée(s).")
    
    @admin.action(description="Désactiver les promotions sélectionnées")
    def deactivate(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} promotion(s) désactivée(s).")