from celery import shared_task
from django.utils import timezone
from .models import Commande, StatutCommande
from .services import StockService
from apps.notifications.services import EmailService


@shared_task
def expire_unpaid_orders():
    """Annule les commandes non livrées après 72h et libère le stock."""
    now = timezone.now()
    expired = Commande.objects.filter(
        statut__in=[StatutCommande.EN_PREPARATION, StatutCommande.EN_LIVRAISON],
        date_expiration_stock__lt=now,
    ).prefetch_related("lignes")

    count = 0
    for commande in expired:
        StockService.liberer(commande.lignes.all())
        commande.statut = StatutCommande.EXPIREE
        commande.save(update_fields=["statut"])
        EmailService.envoi_commande_expiree(commande)
        count += 1
    return f"{count} commande(s) expirée(s)"