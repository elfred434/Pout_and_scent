from django.contrib import admin
from django.core.cache import cache
from .models import (
    Categorie,
    Produit,
    ProduitImage,
    VarianteProduit,
    ProduitInterdit,
    SignalementEffetIndesirable,
)


def invalidate_catalog_cache():
    """Invalide le cache du catalogue quand un produit/catégorie est modifié."""
    cache.clear()


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

    def get_readonly_fields(self, request, obj=None):
        if obj:
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

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        invalidate_catalog_cache()

    def delete_model(self, request, obj):
        super().delete_model(request, obj)
        invalidate_catalog_cache()


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = (
        "nom", "marque", "categorie", "amm_number", "pays_origine",
        "note_moyenne", "is_featured", "is_active", "created_at",
    )
    list_filter = ("categorie", "marque", "is_featured", "is_active", "pays_origine", "created_at")
    search_fields = ("nom", "marque", "description", "amm_number")
    prepopulated_fields = {"slug": ("nom",)}
    readonly_fields = ("note_moyenne", "nb_avis", "created_at", "updated_at")
    inlines = [VarianteProduitInline, ProduitImageInline]
    list_editable = ("is_featured", "is_active")

    fieldsets = (
        ("Informations principales", {
            "fields": ("nom", "marque", "categorie", "description", "slug"),
        }),
        ("Réglementation ABMed (Arrêté du 18/01/2022)", {
            "fields": ("amm_number", "liste_inci", "pays_origine", "date_peremption", "numero_lot"),
            "description": (
                "⚠️ Conformité Arrêté du 18 janvier 2022 : "
                "Tout produit cosmétique doit avoir une AMM avant d'être vendu au Bénin. "
                "La liste INCI des ingrédients est obligatoire."
            ),
        }),
        ("Visibilité", {
            "fields": ("is_featured", "is_active"),
        }),
        ("Statistiques", {
            "fields": ("note_moyenne", "nb_avis"),
        }),
        ("Dates", {
            "fields": ("created_at", "updated_at"),
        }),
    )

    actions = [
        "feature_products", "unfeature_products",
        "activate", "deactivate",
        "check_amm_compliance",
    ]

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

    @admin.action(description="⚠️ Vérifier conformité AMM (cosmétiques sans AMM)")
    def check_amm_compliance(self, request, queryset):
        sans_amm = queryset.filter(
            categorie__type="COSMETIQUE",
            amm_number="",
            is_active=True,
        )
        count = sans_amm.count()
        if count > 0:
            noms = ", ".join(sans_amm.values_list("nom", flat=True)[:10])
            self.message_user(
                request,
                f"⚠️ {count} produit(s) cosmétique(s) sans AMM : {noms}... "
                f"Conformité Arrêté du 18/01/2022 non vérifiée !",
                level="warning",
            )
        else:
            self.message_user(request, "✅ Tous les produits sélectionnés sont conformes.")

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        invalidate_catalog_cache()

    def delete_model(self, request, obj):
        super().delete_model(request, obj)
        invalidate_catalog_cache()

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        invalidate_catalog_cache()


@admin.register(ProduitImage)
class ProduitImageAdmin(admin.ModelAdmin):
    list_display = ("produit", "ordre", "is_primary", "created_at")
    list_filter = ("is_primary", "created_at")
    search_fields = ("produit__nom",)
    readonly_fields = ("created_at", "updated_at")


# ─── ADMIN PRODUITS INTERDITS (Liste noire ABMed) ───────────
@admin.register(ProduitInterdit)
class ProduitInterditAdmin(admin.ModelAdmin):
    list_display = (
        "nom_produit", "marque", "substance_dangereuse",
        "date_interdiction", "is_active",
    )
    list_filter = ("is_active", "date_interdiction", "substance_dangereuse")
    search_fields = ("nom_produit", "marque", "substance_dangereuse")
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        ("Produit interdit", {
            "fields": ("nom_produit", "marque", "substance_dangereuse"),
        }),
        ("Interdiction ABMed", {
            "fields": ("motif_interdiction", "date_interdiction", "is_active"),
            "description": "Communiqué ABMed du 5 mai 2026 — 139 produits interdits",
        }),
        ("Dates", {
            "fields": ("created_at", "updated_at"),
        }),
    )


# ─── ADMIN SIGNALEMENTS EFFETS INDÉSIRABLES ─────────────────
@admin.register(SignalementEffetIndesirable)
class SignalementEffetIndesirableAdmin(admin.ModelAdmin):
    list_display = (
        "id_court", "nom_produit_signale", "email_signalant",
        "gravite", "statut", "transmis_abmed", "created_at",
    )
    list_filter = ("gravite", "statut", "transmis_abmed", "created_at")
    search_fields = ("nom_produit_signale", "email_signalant", "description")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "created_at"

    fieldsets = (
        ("Signalement", {
            "fields": ("produit", "nom_produit_signale", "email_signalant", "telephone_signalant"),
        }),
        ("Détails", {
            "fields": ("description", "gravite"),
        }),
        ("Traitement", {
            "fields": ("statut", "transmis_abmed", "date_transmission_abmed"),
            "description": "⚠️ Obligation ABMed : transmettre les signalements graves à l'agence",
        }),
        ("Dates", {
            "fields": ("created_at", "updated_at"),
        }),
    )

    actions = ["mark_transmis_abmed", "mark_en_cours", "mark_cloture"]

    def id_court(self, obj):
        return str(obj.id)[:8]
    id_court.short_description = "ID"

    @admin.action(description="✅ Marquer comme transmis à l'ABMed")
    def mark_transmis_abmed(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(
            statut="TRANSMIS_ABMED",
            transmis_abmed=True,
            date_transmission_abmed=timezone.now(),
        )
        self.message_user(request, f"{count} signalement(s) marqué(s) comme transmis à l'ABMed.")

    @admin.action(description="🔄 Marquer comme en cours d'examen")
    def mark_en_cours(self, request, queryset):
        count = queryset.update(statut="EN_COURS")
        self.message_user(request, f"{count} signalement(s) marqué(s) en cours.")

    @admin.action(description="🔒 Clôturer les signalements")
    def mark_cloture(self, request, queryset):
        count = queryset.update(statut="CLOTURE")
        self.message_user(request, f"{count} signalement(s) clôturé(s).")
