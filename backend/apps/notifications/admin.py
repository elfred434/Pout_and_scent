from django.contrib import admin
from .models import EmailLog


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ("destinataire", "canal", "statut_badge", "sujet", "created_at")
    list_filter = ("canal", "statut", "created_at")
    search_fields = ("destinataire", "sujet", "user__email")
    readonly_fields = (
        "user", "canal", "destinataire", "sujet", "contenu_html",
        "statut", "erreur", "created_at", "updated_at"
    )
    date_hierarchy = "created_at"
    
    @admin.display(description="Statut")
    def statut_badge(self, obj):
        from django.utils.html import format_html
        colors = {
            "SENT": "#28a745",
            "FAILED": "#dc3545",
            "PENDING": "#ffc107",
        }
        color = colors.get(obj.statut, "#6c757d")
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_statut_display()
        )