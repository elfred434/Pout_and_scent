"""
Admin pour le module Chat — Pout & Scent
"""
from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "sujet",
        "statut",
        "priorite",
        "agent_support",
        "date_dernier_message",
        "is_closed",
        "created_at",
    )
    list_filter = ("statut", "priorite", "is_closed", "created_at")
    search_fields = ("sujet", "client__email", "client__first_name", "client__last_name")
    readonly_fields = ("id", "created_at", "updated_at")
    date_hierarchy = "created_at"
    ordering = ("-date_dernier_message",)

    fieldsets = (
        ("Informations", {
            "fields": ("id", "client", "sujet", "statut", "priorite"),
        }),
        ("Assignation", {
            "fields": ("agent_support", "is_closed"),
        }),
        ("Dates", {
            "fields": ("date_dernier_message", "created_at", "updated_at"),
        }),
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "auteur",
        "type_message",
        "contenu_tronque",
        "is_read",
        "created_at",
    )
    list_filter = ("type_message", "is_read", "created_at")
    search_fields = ("contenu", "auteur__email", "conversation__sujet")
    readonly_fields = ("id", "created_at")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    def contenu_tronque(self, obj):
        return obj.contenu[:100] + "..." if len(obj.contenu) > 100 else obj.contenu
    contenu_tronque.short_description = "Contenu"
