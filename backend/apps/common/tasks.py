import logging

from celery import shared_task
from django.db import connection

logger = logging.getLogger(__name__)


@shared_task
def refresh_kpi_views():
    """Rafraîchit les vues matérialisées de KPI si elles existent."""
    vues = ["mv_kpi_ventes_jour", "mv_top_produits"]
    refreshed = 0

    with connection.cursor() as cursor:
        for vue in vues:
            try:
                cursor.execute(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {vue};")
                refreshed += 1
            except Exception as e:
                logger.debug("Vue matérialisée %s non disponible : %s", vue, e)

    return f"{refreshed} vue(s) matérialisée(s) rafraîchie(s)"
