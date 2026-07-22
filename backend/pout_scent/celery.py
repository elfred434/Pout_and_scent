"""
Configuration Celery — Pout & Scent
Détecte automatiquement l'environnement (dev/prod) via DJANGO_ENV.
"""
import os
from celery import Celery
from celery.schedules import crontab

# Détecte l'environnement automatiquement
_env = os.environ.get("DJANGO_ENV", "dev").lower()
_settings_module = "pout_scent.settings.prod" if _env in ("prod", "production") else "pout_scent.settings.dev"

os.environ.setdefault("DJANGO_SETTINGS_MODULE", _settings_module)

app = Celery("pout_scent")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "expire-unpaid-orders-hourly": {
        "task": "apps.orders.tasks.expire_unpaid_orders",
        "schedule": crontab(minute=0),
    },
    "refresh-materialized-views-hourly": {
        "task": "apps.common.tasks.refresh_kpi_views",
        "schedule": crontab(minute=5),
    },
    "check-promotions-hourly": {
        "task": "apps.promotions.tasks.check_promotion_validity",
        "schedule": crontab(minute=10),
    },
    "check-low-stock-daily": {
        "task": "apps.orders.tasks.check_low_stock",
        "schedule": crontab(hour=8, minute=0),  # Une fois par jour à 8h
    },
}
