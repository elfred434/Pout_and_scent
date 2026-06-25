from celery import shared_task
from django.utils import timezone
from .models import Promotion


@shared_task
def check_promotion_validity():
    now = timezone.now()
    Promotion.objects.filter(date_fin__lt=now, is_active=True).update(is_active=False)
    Promotion.objects.filter(date_debut__gt=now, is_active=True).update(is_active=False)