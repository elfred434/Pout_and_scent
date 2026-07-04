from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import Commande, LigneCommande, StatutCommande
from .services import CommandeTransitionService


class LigneCommandeInline(admin.TabularInline):
    model = LigneCommande
    extra = 0
    readonly_fields = ("variante", "produit_nom", "quantite", "prix_unitaire", "sous_total")
    
    def produit_nom(self, obj):
        return f"{obj.variante.produit.nom} ({obj.variante.contenance_ml}ml)"
    produit_nom.short_description = "Produit"


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = (
        "id_short", "user_email", "statut_badge", "montant_reduit",
        "created_at", "date_expiration_stock", "alerte_expiration"
    )
    list_filter = ("statut", "methode_paiement", "created_at", "created_at")
    search_fields = ("user__email", "user__first_name", "user__last_name", "id")
    date_hierarchy = "created_at"
    readonly_fields = (
        "id", "user", "adresse", "montant_total", "montant_reduit",
        "created_at", "date_expiration_stock", "date_livraison",
        "updated_at"
    )
    inlines = [LigneCommandeInline]
    
    actions = ["mark_en_livraison", "mark_livree", "mark_annulee", "export_csv"]
    
    @admin.display(description="ID")
    def id_short(self, obj):
        return str(obj.id)[:8]
    
    @admin.display(description="Utilisateur")
    def user_email(self, obj):
        return obj.user.email
    
    @admin.display(description="Statut")
    def statut_badge(self, obj):
        colors = {
            StatutCommande.EN_PREPARATION: "#ffc107",
            StatutCommande.EN_LIVRAISON: "#17a2b8",
            StatutCommande.LIVREE: "#28a745",
            StatutCommande.ANNULEE: "#dc3545",
            StatutCommande.EXPIREE: "#6c757d",
        }
        color = colors.get(obj.statut, "#6c757d")
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_statut_display()
        )
    
    @admin.display(description="⏰ Alerte")
    def alerte_expiration(self, obj):
        if obj.statut in (StatutCommande.EN_PREPARATION, StatutCommande.EN_LIVRAISON):
            remaining = obj.date_expiration_stock - timezone.now()
            hours = remaining.total_seconds() / 3600
            if hours < 12:
                return format_html(
                    '<span style="color: #dc3545; font-weight: bold;">⚠️ Expire dans {:.1f}h</span>',
                    hours
                )
        return "—"
    
    @admin.action(description="→ En livraison")
    def mark_en_livraison(self, request, queryset):
        count = 0
        for cmd in queryset.filter(statut=StatutCommande.EN_PREPARATION):
            try:
                CommandeTransitionService.transitionner(cmd, StatutCommande.EN_LIVRAISON)
                count += 1
            except Exception as e:
                self.message_user(request, f"Erreur commande {cmd.id}: {e}", level="ERROR")
        self.message_user(request, f"{count} commande(s) mise(s) en livraison.")
    
    @admin.action(description="→ Livrée")
    def mark_livree(self, request, queryset):
        count = 0
        for cmd in queryset.filter(statut=StatutCommande.EN_LIVRAISON):
            try:
                CommandeTransitionService.transitionner(cmd, StatutCommande.LIVREE)
                count += 1
            except Exception as e:
                self.message_user(request, f"Erreur commande {cmd.id}: {e}", level="ERROR")
        self.message_user(request, f"{count} commande(s) marquée(s) livrée(s).")
    
    @admin.action(description="→ Annulée (libère stock)")
    def mark_annulee(self, request, queryset):
        count = 0
        for cmd in queryset.filter(statut__in=[StatutCommande.EN_PREPARATION, StatutCommande.EN_LIVRAISON]):
            try:
                CommandeTransitionService.transitionner(cmd, StatutCommande.ANNULEE)
                count += 1
            except Exception as e:
                self.message_user(request, f"Erreur commande {cmd.id}: {e}", level="ERROR")
        self.message_user(request, f"{count} commande(s) annulée(s).")
    
    @admin.action(description="Exporter en CSV")
    def export_csv(self, request, queryset):
        self.message_user(request, f"Export de {queryset.count()} commande(s) - Fonctionnalité à implémenter")