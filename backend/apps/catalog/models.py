import os
import uuid
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from apps.common.models import TimeStampedModel


def upload_categorie_image(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    return f"categories/{instance.id or uuid.uuid4()}{ext}"


def upload_produit_image(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    return f"products/{instance.produit_id}/{uuid.uuid4().hex}{ext}"


ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 Mo


def validate_image_file(value):
    """Validation SANS Pillow : extension + taille uniquement."""
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            f"Extension non autorisée : {ext}. Autorisées : {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    if value.size > MAX_IMAGE_SIZE:
        raise ValidationError("L'image ne doit pas dépasser 5 Mo.")


class TypeCategorie(models.TextChoices):
    PARFUM = "PARFUM", "Parfum"
    COSMETIQUE = "COSMETIQUE", "Cosmétique"


class Categorie(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=150)
    type = models.CharField(max_length=20, choices=TypeCategorie.choices, db_index=True)
    slug = models.SlugField(max_length=180, unique=True)
    description = models.TextField(blank=True)
    image = models.FileField(
        upload_to=upload_categorie_image, blank=True,
        validators=[validate_image_file]
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        indexes = [GinIndex(fields=["nom"], name="gin_categorie_nom")]

    def __str__(self):
        return self.nom


class Produit(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=255, db_index=True)
    marque = models.CharField(max_length=150, db_index=True)
    description = models.TextField(blank=True)
    categorie = models.ForeignKey(Categorie, on_delete=models.PROTECT, related_name="produits")
    note_moyenne = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    nb_avis = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False, db_index=True, verbose_name="Mis en avant")
    is_active = models.BooleanField(default=True, db_index=True)
    search_vector = SearchVectorField(null=True, blank=True)

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        indexes = [
            GinIndex(fields=["search_vector"], name="gin_produit_search"),
            models.Index(fields=["-created_at"]),
            models.Index(fields=["marque", "is_active"]),
            models.Index(fields=["categorie", "is_active"]),
        ]

    def __str__(self):
        return f"{self.marque} - {self.nom}"


class ProduitImage(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name="images")
    image = models.FileField(upload_to=upload_produit_image, validators=[validate_image_file])
    ordre = models.PositiveSmallIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["ordre", "created_at"]
        indexes = [models.Index(fields=["produit", "ordre"])]

    def __str__(self):
        return f"Image {self.ordre} de {self.produit_id}"
    
class VarianteProduit(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name="variantes")
    contenance_ml = models.PositiveBigIntegerField(verbose_name="Contenance (ml)")
    prix = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix (XOF)")
    stock = models.IntegerField(default=0)
    sku = models.CharField(max_length=80, unique=True)
    is_active = models.BooleanField(default=True, db_index=True)
     
    class Meta:
        verbose_name = "Variante"
        verbose_name_plural = "Variantes"
        constraints = [
            models.UniqueConstraint(fields=["produit", "contenance_ml"], name="unique_contenance_par_produit"),
            models.CheckConstraint(check=models.Q(stock__gte=0), name="stock_positif"),
        ]
        indexes = [models.Index(fields=["produit", "is_active"])]

    def __str__(self):
        return f"{self.produit.nom} - {self.contenance_ml}ml"