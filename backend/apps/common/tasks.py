from celery import shared_task
from django.db import connection


@shared_task
def refresh_kpi_views():
    """Rafraîchit les vues matérialisées de KPI si elles existent."""
    vues = ["mv_kpi_ventes_jour", "mv_top_produits"]
    with connection.cursor() as cursor:
        for vue in vues:
            try:
                cursor.execute(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {vue};")
            except Exception:
                pass