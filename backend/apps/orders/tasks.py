from celery import shared_task
from django.utils import timezone
from .models import Commande, StatutCommande
from .services import StockService, CommandeTransitionService
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
        try:
            CommandeTransitionService.transitionner(commande, StatutCommande.EXPIREE)
            count += 1
        except Exception as e:
            logger.error(f"Erreur lors de l'expiration de la commande {commande.id}: {e}")
    
    return f"{count} commande(s) expirée(s)"


@shared_task
def check_low_stock():
    """Vérifie les stocks faibles et envoie des alertes."""
    from django.conf import settings
    from apps.catalog.models import VarianteProduit
    from apps.users.models import User
    
    low_stock_variants = VarianteProduit.objects.filter(
        stock__lt=settings.LOW_STOCK_THRESHOLD,
        is_active=True
    ).select_related("produit")
    
    if low_stock_variants.exists():
        admins = User.objects.filter(role="ADMIN", is_active=True)
        for admin in admins:
            EmailService.envoi_alerte_stock_faible(admin, low_stock_variants)
    
    return f"{low_stock_variants.count()} variante(s) en stock faible"