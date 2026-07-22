from django.conf import settings
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.common.models import BaseModel


class StatutCommande(models.TextChoices):
    EN_PREPARATION = "EN_PREPARATION", "En préparation"
    EN_LIVRAISON = "EN_LIVRAISON", "En livraison"
    LIVREE = "LIVREE", "Livrée"
    ANNULEE = "ANNULEE", "Annulée"
    EXPIREE = "EXPIREE", "Expirée (72h)"


class MethodePaiement(models.TextChoices):
    LIVRAISON = "LIVRAISON", "Paiement à la livraison"


class Commande(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="commandes"
    )
    adresse = models.ForeignKey(
        "users.Adresse",
        on_delete=models.PROTECT,
        related_name="commandes"
    )
    statut = models.CharField(
        max_length=20,
        choices=StatutCommande.choices,
        default=StatutCommande.EN_PREPARATION,
        db_index=True
    )
    montant_total = models.DecimalField(max_digits=10, decimal_places=2)
    montant_reduit = models.DecimalField(max_digits=10, decimal_places=2)
    methode_paiement = models.CharField(
        max_length=20,
        choices=MethodePaiement.choices,
        default=MethodePaiement.LIVRAISON
    )
    notes_client = models.TextField(blank=True)
    notes_admin = models.TextField(blank=True)
    date_livraison = models.DateTimeField(null=True, blank=True)
    date_expiration_stock = models.DateTimeField(db_index=True)

    class Meta:
        verbose_name = "Commande"
        verbose_name_plural = "Commandes"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["statut", "date_expiration_stock"]),
        ]

    def save(self, *args, **kwargs):
        if not self.date_expiration_stock:
            self.date_expiration_stock = timezone.now() + timedelta(hours=settings.STOCK_EXPIRY_HOURS)
        super().save(*args, **kwargs)

    @property
    def est_livrable(self):
        return self.statut in (StatutCommande.EN_PREPARATION, StatutCommande.EN_LIVRAISON)

    def __str__(self):
        return f"Commande {self.id} - {self.user.email}"


class LigneCommande(BaseModel):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="lignes")
    variante = models.ForeignKey(
        "catalog.VarianteProduit",
        on_delete=models.PROTECT,
        related_name="+"
    )
    quantite = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    sous_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        constraints = [models.CheckConstraint(check=models.Q(quantite__gt=0), name="quantite_positif")]

    def __str__(self):
        return f"{self.quantite}x {self.variante}"