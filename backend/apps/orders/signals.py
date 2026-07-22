from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Commande, StatutCommande
from apps.notifications.services import EmailService


@receiver(post_save, sender=Commande)
def commande_status_changed(sender, instance, created, **kwargs):
    """Envoie une notification lors d'un changement de statut de commande."""
    if not created and instance.statut in [
        StatutCommande.EN_LIVRAISON,
        StatutCommande.LIVREE,
        StatutCommande.ANNULEE,
        StatutCommande.EXPIREE,
    ]:
        EmailService.envoi_changement_statut(instance)