from django.core.management.base import BaseCommand
from apps.orders.tasks import expire_unpaid_orders


class Command(BaseCommand):
    help = "Annule les commandes non livrées après 72h et libère le stock"

    def handle(self, *args, **kwargs):
        self.stdout.write("Vérification des commandes expirées...")
        result = expire_unpaid_orders()
        self.stdout.write(self.style.SUCCESS(result))