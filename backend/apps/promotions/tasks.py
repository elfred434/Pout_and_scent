import logging

from celery import shared_task
from django.utils import timezone

from .models import Promotion

logger = logging.getLogger(__name__)


@shared_task
def check_promotion_validity():
    """Désactive les promotions expirées et celles qui ne sont pas encore actives."""
    now = timezone.now()

    expired_count = Promotion.objects.filter(date_fin__lt=now, is_active=True).update(is_active=False)
    future_count = Promotion.objects.filter(date_debut__gt=now, is_active=True).update(is_active=False)

    if expired_count or future_count:
        logger.info(
            "Promotions mises à jour : %d expirée(s), %d future(s) désactivée(s)",
            expired_count, future_count,
        )

    return f"{expired_count} expirée(s), {future_count} future(s) désactivée(s)"
