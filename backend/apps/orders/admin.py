from django.contrib import admin
from django.utils import timezone
from .models import Commande, LigneCommande, StatutCommande
from .services import StockService
from apps.notifications.services import EmailService


class LigneCommandeInline(admin.TabularInline):
    model = LigneCommande
    extra = 0
    readonly_fields = ("variante", "quantite", "prix_unitaire", "sous_total")


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ("id_short", "user", "statut", "montant_reduit", "created_at", "date_expiration_stock", "alerte_expiration")
    list_filter = ("statut", "created_at", "methode_paiement")
    search_fields = ("user__email", "id")
    date_hierarchy = "created_at"
    inlines = [LigneCommandeInline]
    readonly_fields = ("id", "user", "adresse", "montant_total", "montant_reduit", "created_at", "date_expiration_stock")
    actions = ["mark_en_livraison", "mark_livree", "mark_annulee"]

    @admin.display(description="ID")
    def id_short(self, obj):
        return str(obj.id)[:8]

    @admin.display(description="⏰ Alerte")
    def alerte_expiration(self, obj):
        if obj.statut in (StatutCommande.EN_PREPARATION, StatutCommande.EN_LIVRAISON):
            remaining = obj.date_expiration_stock - timezone.now()
            hours = remaining.total_seconds() / 3600
            if hours < 12:
                return f"⚠️ Expire dans {hours:.1f}h"
        return "—"

    def _transition(self, request, queryset, statut):
        for cmd in queryset.filter(statut__in=[StatutCommande.EN_PREPARATION, StatutCommande.EN_LIVRAISON]):
            if statut == StatutCommande.ANNULEE:
                StockService.liberer(cmd.lignes.all())
            cmd.statut = statut
            if statut == StatutCommande.LIVREE:
                cmd.date_livraison = timezone.now()
            cmd.save()
            EmailService.envoi_changement_statut(cmd)
        self.message_user(request, f"{queryset.count()} commande(s) mise(s) à jour.")

    @admin.action(description="→ En livraison")
    def mark_en_livraison(self, request, queryset):
        self._transition(request, queryset, StatutCommande.EN_LIVRAISON)

    @admin.action(description="→ Livrée")
    def mark_livree(self, request, queryset):
        self._transition(request, queryset, StatutCommande.LIVREE)

    @admin.action(description="→ Annulée (libère stock)")
    def mark_annulee(self, request, queryset):
        self._transition(request, queryset, StatutCommande.ANNULEE)