import uuid
from django.conf import settings
from django.db import models
from apps.common.models import BaseModel  # ✅ CHANGÉ : BaseModel


class CanalEmail(models.TextChoices):
    WELCOME = "WELCOME", "Bienvenue"
    ORDER_CONFIRM = "ORDER_CONFIRM", "Confirmation commande"
    ORDER_STATUS = "ORDER_STATUS", "Changement statut"
    ORDER_EXPIRED = "ORDER_EXPIRED", "Commande expirée"
    OTP = "OTP", "Code OTP"
    PASSWORD_RESET = "PASSWORD_RESET", "Réinitialisation mot de passe"
    LOW_STOCK = "LOW_STOCK", "Stock faible"
    PROMO = "PROMO", "Promotion"


class StatutEnvoi(models.TextChoices):
    PENDING = "PENDING", "En attente"
    SENT = "SENT", "Envoyé"
    FAILED = "FAILED", "Échec"


class EmailLog(BaseModel):  # ✅ CHANGÉ : BaseModel
    # Plus besoin de redéclarer id
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    canal = models.CharField(max_length=30, choices=CanalEmail.choices, db_index=True)
    destinataire = models.EmailField()
    sujet = models.CharField(max_length=255)
    contenu_html = models.TextField()
    statut = models.CharField(max_length=10, choices=StatutEnvoi.choices, default=StatutEnvoi.PENDING)
    erreur = models.TextField(blank=True)

    class Meta:
        indexes = [models.Index(fields=["-created_at"])]