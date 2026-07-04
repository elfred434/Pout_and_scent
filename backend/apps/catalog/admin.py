from django.contrib import admin
from .models import Categorie, Produit, ProduitImage, VarianteProduit


class ProduitImageInline(admin.TabularInline):
    model = ProduitImage
    extra = 1
    fields = ("image", "ordre", "is_primary")
    readonly_fields = ("created_at",)


class VarianteProduitInline(admin.TabularInline):
    model = VarianteProduit
    extra = 1
    fields = ("contenance_ml", "prix", "stock", "sku", "is_active")
    readonly_fields = ("created_at", "updated_at")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("produit")

    # Optionnel : rendre le SKU en lecture seule après la création
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Mode édition
            return self.readonly_fields + ("sku",)
        return self.readonly_fields


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ("nom", "type", "slug", "is_active", "created_at")
    list_filter = ("type", "is_active", "created_at")
    search_fields = ("nom", "slug", "description")
    prepopulated_fields = {"slug": ("nom",)}
    readonly_fields = ("created_at", "updated_at")
    
    actions = ["activate", "deactivate"]
    
    @admin.action(description="Activer les catégories sélectionnées")
    def activate(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} catégorie(s) activée(s).")
    
    @admin.action(description="Désactiver les catégories sélectionnées")
    def deactivate(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} catégorie(s) désactivée(s).")


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ("nom", "marque", "categorie", "note_moyenne", "nb_avis", "is_featured", "is_active", "created_at")
    list_filter = ("categorie", "marque", "is_featured", "is_active", "created_at")
    search_fields = ("nom", "marque", "description")
    prepopulated_fields = {"slug": ("nom",)}
    readonly_fields = ("note_moyenne", "nb_avis", "created_at", "updated_at")
    inlines = [VarianteProduitInline, ProduitImageInline]
    
    list_editable = ("is_featured", "is_active")
    
    actions = ["feature_products", "unfeature_products", "activate", "deactivate"]
    
    @admin.action(description="Mettre en avant les produits sélectionnés")
    def feature_products(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f"{count} produit(s) mis en avant.")
    
    @admin.action(description="Retirer de la mise en avant")
    def unfeature_products(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f"{count} produit(s) retirés de la mise en avant.")
    
    @admin.action(description="Activer les produits sélectionnés")
    def activate(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} produit(s) activé(s).")
    
    @admin.action(description="Désactiver les produits sélectionnés")
    def deactivate(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} produit(s) désactivé(s).")


@admin.register(ProduitImage)
class ProduitImageAdmin(admin.ModelAdmin):
    list_display = ("produit", "ordre", "is_primary", "created_at")
    list_filter = ("is_primary", "created_at")
    search_fields = ("produit__nom",)
    readonly_fields = ("created_at", "updated_at")