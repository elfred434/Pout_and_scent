"""
Modèles du module Chat — Pout & Scent
Gère les conversations et messages entre clients et support.
"""
import uuid
import logging

from django.conf import settings
from django.db import models
from apps.common.models import BaseModel

logger = logging.getLogger(__name__)


class StatutConversation(models.TextChoices):
    OUVERTE = "OUVERTE", "Ouverte"
    EN_COURS = "EN_COURS", "En cours (prise en charge)"
    RESOLUE = "RESOLUE", "Résolue"
    FERMEE = "FERMEE", "Fermée"


class PrioriteConversation(models.TextChoices):
    BASSE = "BASSE", "Basse"
    MOYENNE = "MOYENNE", "Moyenne"
    HAUTE = "HAUTE", "Haute"
    URGENTE = "URGENTE", "Urgente"


class Conversation(BaseModel):
    """
    Conversation entre un client et le support.
    Une conversation peut contenir plusieurs messages.
    """
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations",
        verbose_name="Client",
    )
    sujet = models.CharField(
        max_length=255,
        verbose_name="Sujet de la conversation",
        help_text="Sujet ou première ligne du message",
    )
    statut = models.CharField(
        max_length=20,
        choices=StatutConversation.choices,
        default=StatutConversation.OUVERTE,
        db_index=True,
    )
    priorite = models.CharField(
        max_length=10,
        choices=PrioriteConversation.choices,
        default=PrioriteConversation.MOYENNE,
        db_index=True,
    )
    agent_support = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conversations_assignees",
        verbose_name="Agent support assigné",
    )
    date_dernier_message = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Date du dernier message",
    )
    is_closed = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Fermée",
    )

    class Meta:
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"
        ordering = ["-date_dernier_message"]
        indexes = [
            models.Index(fields=["client", "-date_dernier_message"]),
            models.Index(fields=["statut", "-date_dernier_message"]),
            models.Index(fields=["agent_support", "statut"]),
        ]

    def __str__(self):
        return f"Conv #{self.id} — {self.client.email} ({self.statut})"

    @property
    def dernier_message(self):
        return self.messages.order_by("-created_at").first()

    @property
    def nb_messages_non_lus(self):
        return self.messages.filter(is_read=False).count()


class Message(BaseModel):
    """
    Message individuel dans une conversation.
    Peut être envoyé par le client ou un agent support.
    """
    TYPE_CLIENT = "CLIENT"
    TYPE_AGENT = "AGENT"
    TYPE_SYSTEM = "SYSTEM"

    TYPE_CHOICES = [
        (TYPE_CLIENT, "Client"),
        (TYPE_AGENT, "Agent support"),
        (TYPE_SYSTEM, "Système"),
    ]

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
        verbose_name="Conversation",
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="messages_envoyes",
        verbose_name="Auteur",
    )
    type_message = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES,
        default=TYPE_CLIENT,
        db_index=True,
    )
    contenu = models.TextField(
        verbose_name="Contenu du message",
    )
    is_read = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Lu",
    )
    date_read = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de lecture",
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name="Adresse IP",
    )

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["conversation", "-created_at"]),
            models.Index(fields=["type_message", "is_read"]),
        ]

    def __str__(self):
        auteur_nom = self.auteur.email if self.auteur else "Système"
        return f"Msg #{self.id} — {auteur_nom} ({self.type_message})"
