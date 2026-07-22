from django.contrib import admin
from .models import Categorie, Produit, ProduitImage, VarianteProduit


class ProduitImageInline(admin.TabularInline):
    model = ProduitImage
    extra = 1


class VarianteProduitInline(admin.TabularInline):
    model = VarianteProduit
    extra = 1
    fields = ("contenance_ml", "prix", "stock", "sku", "is_active")


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ("nom", "type", "slug", "is_active")
    list_filter = ("type", "is_active")
    search_fields = ("nom", "slug")
    prepopulated_fields = {"slug": ("nom",)}


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ("nom", "marque", "categorie", "note_moyenne", "nb_avis", "is_featured", "is_active")
    list_filter = ("categorie", "marque", "is_featured", "is_active")
    search_fields = ("nom", "marque", "description")
    inlines = [VarianteProduitInline, ProduitImageInline]
    list_editable = ("is_featured", "is_active")