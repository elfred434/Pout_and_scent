import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from .models import CanalEmail, EmailLog, StatutEnvoi

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def _send(user, canal: str, destinataire: str, sujet: str, template: str, context: dict):
        try:
            html = render_to_string(f"emails/{template}.html", context)
            msg = EmailMultiAlternatives(
                subject=sujet,
                body="",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[destinataire],
            )
            msg.attach_alternative(html, "text/html")
            msg.send()
            EmailLog.objects.create(
                user=user,
                canal=canal,
                destinataire=destinataire,
                sujet=sujet,
                contenu_html=html,
                statut=StatutEnvoi.SENT,
            )
        except Exception as e:
            logger.exception("Erreur envoi email")
            EmailLog.objects.create(
                user=user,
                canal=canal,
                destinataire=destinataire,
                sujet=sujet,
                contenu_html="",
                statut=StatutEnvoi.FAILED,
                erreur=str(e),
            )

    @classmethod
    def envoi_confirmation(cls, commande):
        cls._send(
            user=commande.user,
            canal=CanalEmail.ORDER_CONFIRM,
            destinataire=commande.user.email,
            sujet=f"Confirmation de votre commande {str(commande.id)[:8]}",
            template="order_confirmation",
            context={"commande": commande},
        )

    @classmethod
    def envoi_changement_statut(cls, commande):
        cls._send(
            user=commande.user,
            canal=CanalEmail.ORDER_STATUS,
            destinataire=commande.user.email,
            sujet=f"Votre commande {str(commande.id)[:8]} : {commande.get_statut_display()}",
            template="order_status",
            context={"commande": commande},
        )

    @classmethod
    def envoi_commande_expiree(cls, commande):
        cls._send(
            user=commande.user,
            canal=CanalEmail.ORDER_EXPIRED,
            destinataire=commande.user.email,
            sujet=f"Votre commande {str(commande.id)[:8]} a expiré",
            template="order_expired",
            context={"commande": commande},
        )

    @classmethod
    def envoi_otp(cls, email: str, code: str):
        cls._send(
            user=None,
            canal=CanalEmail.OTP,
            destinataire=email,
            sujet="Votre code de vérification Pout & Scent",
            template="otp",
            context={"code": code},
        )

    @classmethod
    def envoi_reset_password(cls, email: str, token: str):
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        cls._send(
            user=None,
            canal=CanalEmail.PASSWORD_RESET,
            destinataire=email,
            sujet="Réinitialisation de votre mot de passe",
            template="reset_password",
            context={"reset_url": reset_url},
        )