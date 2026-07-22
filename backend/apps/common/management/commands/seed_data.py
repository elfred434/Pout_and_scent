from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.catalog.models import Categorie, Produit, VarianteProduit
from apps.promotions.models import Promotion, TypePromotion
from apps.users.models import Adresse

User = get_user_model()


class Command(BaseCommand):
    help = "Seed la base avec des données de démo"

    def handle(self, *args, **kwargs):
        self.stdout.write("Création des données de démo...")
        
        # Admin
        admin, created = User.objects.get_or_create(
            email="admin@poutscent.bj",
            defaults={
                "role": "ADMIN",
                "is_staff": True,
                "is_superuser": True,
                "first_name": "Admin",
                "last_name": "Pout&Scent"
            }
        )
        if created:
            admin.set_password("Admin123456!")
            admin.save()
            self.stdout.write(self.style.SUCCESS("✅ Admin créé"))
        
        # Clients
        clients_data = [
            ("client1@demo.bj", "Awa", "Johnson"),
            ("client2@demo.bj", "Kofi", "Mensah"),
            ("client3@demo.bj", "Fatou", "Diallo"),
        ]
        for email, first, last in clients_data:
            client, created = User.objects.get_or_create(
                email=email,
                defaults={"role": "CLIENT", "first_name": first, "last_name": last}
            )
            if created:
                client.set_password("Client123456!")
                client.save()
                Adresse.objects.create(
                    user=client,
                    libelle="Maison",
                    ville="Cotonou",
                    quartier="Haie Vive",
                    telephone_contact="+22900000000",
                    is_default=True
                )
                self.stdout.write(self.style.SUCCESS(f"✅ Client créé: {email}"))
        
        # Catégories
        categories_data = [
            ("Parfums homme", "PARFUM"),
            ("Parfums femme", "PARFUM"),
            ("Soins visage", "COSMETIQUE"),
            ("Maquillage", "COSMETIQUE"),
        ]
        categories = []
        for nom, type_ in categories_data:
            cat, created = Categorie.objects.get_or_create(
                nom=nom,
                defaults={"type": type_, "slug": nom.lower().replace(" ", "-")}
            )
            categories.append(cat)
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Catégorie créée: {nom}"))
        
        # Produits
        produits_data = [
            ("Sauvage", "Dior", categories[0]),
            ("Bleu de Chanel", "Chanel", categories[0]),
            ("La Vie Est Belle", "Lancôme", categories[1]),
            ("Black Opium", "YSL", categories[1]),
            ("Crème hydratante", "CeraVe", categories[2]),
            ("Sérum vitamine C", "The Ordinary", categories[2]),
        ]
        for nom, marque, cat in produits_data:
            p, created = Produit.objects.get_or_create(
                nom=nom,
                defaults={"marque": marque, "categorie": cat}
            )
            if created:
                for ml, prix in [(30, 15000), (50, 25000), (100, 45000)]:
                    VarianteProduit.objects.get_or_create(
                        produit=p,
                        contenance_ml=ml,
                        defaults={
                            "prix": Decimal(str(prix)),
                            "stock": 20,
                            "sku": f"{marque[:3].upper()}-{nom[:3].upper()}-{ml}"
                        }
                    )
                self.stdout.write(self.style.SUCCESS(f"✅ Produit créé: {nom}"))
        
        # Promotions
        promos_data = [
            ("Soldes été", categories[0], TypePromotion.POURCENTAGE, Decimal("20")),
            ("Black Friday", categories[1], TypePromotion.POURCENTAGE, Decimal("30")),
        ]
        for nom, cat, type_, valeur in promos_data:
            promo, created = Promotion.objects.get_or_create(
                nom=nom,
                defaults={
                    "categorie": cat,
                    "type": type_,
                    "valeur": valeur,
                    "date_debut": timezone.now(),
                    "date_fin": timezone.now() + timedelta(days=30),
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Promotion créée: {nom}"))
        
        self.stdout.write(self.style.SUCCESS("\n✅ Seed terminé avec succès !"))