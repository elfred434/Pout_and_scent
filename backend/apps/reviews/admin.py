from django.contrib import admin
from .models import Avis


@admin.register(Avis)
class AvisAdmin(admin.ModelAdmin):
    list_display = ("produit", "user", "note", "is_visible", "created_at")
    list_filter = ("note", "is_visible", "created_at")
    search_fields = ("produit__nom", "user__email", "user__first_name", "commentaire")
    readonly_fields = ("created_at", "updated_at")
    
    actions = ["approuver", "masquer"]
    
    @admin.action(description="Approuver (visible)")
    def approuver(self, request, queryset):
        count = queryset.update(is_visible=True)
        self.message_user(request, f"{count} avis approuvé(s).")
    
    @admin.action(description="Masquer")
    def masquer(self, request, queryset):
        count = queryset.update(is_visible=False)
        self.message_user(request, f"{count} avis masqué(s).")