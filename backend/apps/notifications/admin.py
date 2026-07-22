from django.contrib import admin
from .models import EmailLog


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ("destinataire", "canal", "statut", "created_at")
    list_filter = ("canal", "statut")
    search_fields = ("destinataire", "sujet")
    readonly_fields = ("user", "canal", "destinataire", "sujet", "contenu_html", "statut", "erreur", "created_at")