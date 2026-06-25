import uuid
from django.core.exceptions import ValidationError
from django.db import models
from apps.common.models import BaseModel  # ✅ CHANGÉ : BaseModel au lieu de TimeStampedModel


class TypePromotion(models.TextChoices):
    POURCENTAGE = "POURCENTAGE", "Pourcentage"
    MONTANT_FIXE = "MONTANT_FIXE", "Montant fixe (XOF)"


class Promotion(BaseModel):  # ✅ CHANGÉ : BaseModel
    # Plus besoin de redéclarer id (déjà dans BaseModel)
    nom = models.CharField(max_length=200)
    produit = models.ForeignKey(
        "catalog.Produit", on_delete=models.CASCADE, null=True, blank=True, related_name="promotions"
    )
    categorie = models.ForeignKey(
        "catalog.Categorie", on_delete=models.CASCADE, null=True, blank=True, related_name="promotions"
    )
    type = models.CharField(max_length=20, choices=TypePromotion.choices)
    valeur = models.DecimalField(max_digits=10, decimal_places=2)
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    code = models.CharField(max_length=50, blank=True, null=True, unique=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name = "Promotion"  # ✅ ESPACE SUPPRIMÉ
        verbose_name_plural = "Promotions"  # ✅ ESPACE SUPPRIMÉ
        constraints = [
            models.CheckConstraint(
                check=(models.Q(produit__isnull=False) | models.Q(categorie__isnull=False)),
                name="promo_cible_requise"  # ✅ ESPACE SUPPRIMÉ
            ),
            models.CheckConstraint(
                check=models.Q(date_fin__gte=models.F("date_debut")),
                name="promo_dates_coherentes"  # ✅ ESPACE SUPPRIMÉ
            ),
        ]
        indexes = [
            models.Index(fields=["date_debut", "date_fin", "is_active"]),
        ]

    def clean(self):
        super().clean()
        if not self.produit_id and not self.categorie_id:
            raise ValidationError("Une promotion doit cibler un produit ou une catégorie.")
        if self.type == TypePromotion.POURCENTAGE and not (0 < self.valeur <= 100):
            raise ValidationError("Le pourcentage doit être entre 0 et 100.")

    def __str__(self):
        return self.nom