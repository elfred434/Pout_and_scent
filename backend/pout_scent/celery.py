import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pout_scent.settings.dev")

app = Celery("pout_scent")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "expire-unpaid-orders-hourly":{
        "task": "apps.orders.tasks.expire_unpaid_orders",
        "schedule": crontab(minute=0)
    },
    "refresh-materialized-views-hourly":{
        "task": "apps.common.tasks.refresh_kpi_views",
        "schedule": crontab(minute=5),
    },
    "check-promotions-hourly": {
        "task": "apps.promotions.tasks.check_promotion_validity",
        "schedule": crontab(minute=10),
    },
    
}