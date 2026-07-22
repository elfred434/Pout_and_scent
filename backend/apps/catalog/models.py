import os
import uuid
import logging

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from apps.common.models import TimeStampedModel

logger = logging.getLogger(__name__)


# ============================================================
# HELPERS UPLOAD
# ============================================================
def upload_categorie_image(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    return f"categories/{instance.id or uuid.uuid4()}{ext}"


def upload_produit_image(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    return f"products/{instance.produit_id}/{uuid.uuid4().hex}{ext}"


ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 Mo


def validate_image_file(value):
    """Validation complète : extension + taille + content-type + magic bytes."""
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            f"Extension non autorisée : {ext}. Autorisées : {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    if value.size > MAX_IMAGE_SIZE:
        raise ValidationError("L'image ne doit pas dépasser 5 Mo.")

    # Vérification du content-type
    if hasattr(value, "content_type") and value.content_type not in ALLOWED_CONTENT_TYPES:
        raise ValidationError(
            f"Type de fichier non autorisé : {value.content_type}"
        )

    # Vérification des magic bytes (signature du fichier)
    MAGIC_BYTES = {
        b"\xff\xd8\xff": "image/jpeg",
        b"\x89PNG": "image/png",
        b"RIFF": "image/webp",
        b"GIF8": "image/gif",
    }
    value.seek(0)
    header = value.read(8)
    value.seek(0)
    if not any(header.startswith(magic) for magic in MAGIC_BYTES):
        raise ValidationError("Le fichier ne semble pas être une image valide.")


# ============================================================
# MODÈLES
# ============================================================
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
        validators=[validate_image_file],
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        indexes = [
            models.Index(fields=["nom"], name="idx_categorie_nom"),
            models.Index(fields=["type", "is_active"]),
        ]

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
    search_vector = SearchVectorField(null=True, blank=True, editable=False)
    slug = models.SlugField(max_length=280, unique=True, blank=True)

    # ─── CHAMPS RÉGLEMENTAIRES ABMed (Arrêté du 18/01/2022) ───
    amm_number = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="N° AMM",
        help_text="Numéro d'autorisation de mise sur le marché (ABMed)",
    )
    liste_inci = models.TextField(
        blank=True,
        verbose_name="Liste INCI",
        help_text="Liste complète des ingrédients (nomenclature INCI)",
    )
    pays_origine = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Pays d'origine",
        help_text="Pays de fabrication du produit",
    )
    date_peremption = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date de péremption",
        help_text="Date limite d'utilisation (si applicable)",
    )
    numero_lot = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Numéro de lot",
        help_text="Numéro de lot du fabricant pour traçabilité",
    )

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        indexes = [
            GinIndex(fields=["search_vector"], name="gin_produit_search"),
            models.Index(fields=["-created_at"]),
            models.Index(fields=["marque", "is_active"]),
            models.Index(fields=["categorie", "is_active"]),
            models.Index(fields=["slug"]),
        ]

    def clean(self):
        """Validation et génération du slug + vérification conformité ABMed."""
        # ─── Validation slug ───
        if not self.slug or self._slug_needs_update():
            base_slug = slugify(f"{self.marque}-{self.nom}")
            if not base_slug:
                raise ValidationError("Le slug ne peut pas être généré avec un nom/marque vide.")

            slug = base_slug
            counter = 1
            queryset = Produit.objects.filter(slug=slug)
            if self.pk:
                queryset = queryset.exclude(pk=self.pk)

            while queryset.exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        # ─── Validation ABMed : vérifier la liste noire ───
        if self.nom and self.marque:
            nom_lower = self.nom.lower().strip()
            marque_lower = self.marque.lower().strip()
            produits_interdits = ProduitInterdit.objects.filter(is_active=True)
            for interdit in produits_interdits:
                nom_interdit = interdit.nom_produit.lower().strip()
                marque_interdite = interdit.marque.lower().strip() if interdit.marque else ""
                # Vérifier si le produit correspond à un produit interdit
                if nom_interdit in nom_lower or nom_lower in nom_interdit:
                    if not marque_interdite or marque_interdite in marque_lower or marque_lower in marque_interdite:
                        raise ValidationError(
                            f"❌ PRODUIT INTERDIT par l'ABMed : '{self.marque} - {self.nom}' "
                            f"correspond au produit interdit '{interdit.nom_produit}'. "
                            f"Motif : {interdit.motif_interdiction}. "
                            f"Réf. : Communiqué ABMed du {interdit.date_interdiction}."
                        )

        # ─── Validation : produits cosmétiques doivent avoir une AMM ───
        if self.categorie and self.categorie.type == "COSMETIQUE" and self.is_active:
            if not self.amm_number:
                logger.warning(
                    "Produit cosmétique '%s' sans AMM — "
                    "Conformité Arrêté du 18/01/2022 non vérifiée",
                    self.nom,
                )

    def _slug_needs_update(self):
        if not self.pk:
            return True
        try:
            original = Produit.objects.get(pk=self.pk)
            return original.nom != self.nom or original.marque != self.marque
        except Produit.DoesNotExist:
            return True

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

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
    contenance_ml = models.PositiveIntegerField(verbose_name="Contenance (ml)")
    prix = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix (XOF)")
    stock = models.IntegerField(default=0)
    sku = models.CharField(max_length=80, unique=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    def save(self, *args, **kwargs):
        if not self.sku:
            marque_slug = slugify(self.produit.marque).upper().replace("-", "")[:4]
            nom_slug = slugify(self.produit.nom).upper().replace("-", "")[:4]
            base_sku = f"{marque_slug}-{nom_slug}-{self.contenance_ml}ml"

            sku = base_sku
            counter = 1
            while VarianteProduit.objects.filter(sku=sku).exclude(id=self.id).exists():
                sku = f"{base_sku}-{counter}"
                counter += 1
            self.sku = sku

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Variante"
        verbose_name_plural = "Variantes"
        constraints = [
            models.UniqueConstraint(
                fields=["produit", "contenance_ml"],
                name="unique_contenance_par_produit",
            ),
            models.CheckConstraint(
                condition=models.Q(stock__gte=0),
                name="stock_positif",
            ),
        ]
        indexes = [models.Index(fields=["produit", "is_active"])]

    def __str__(self):
        return f"{self.produit.nom} - {self.contenance_ml}ml ({self.sku})"


# ============================================================
# LISTE NOIRE ABMed — Produits interdits au Bénin
# (Communiqué ABMed du 5 mai 2026 — 139 produits)
# ============================================================
class ProduitInterdit(TimeStampedModel):
    """
    Produit cosmétique interdit par l'ABMed.
    Utilisé pour la validation automatique lors de la création de produits.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom_produit = models.CharField(
        max_length=255,
        verbose_name="Nom du produit interdit",
        db_index=True,
    )
    marque = models.CharField(
        max_length=150,
        blank=True,
        verbose_name="Marque",
        db_index=True,
    )
    substance_dangereuse = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Substance dangereuse",
        help_text="Ex: Corticoïdes, Hydroquinone, Mercure...",
    )
    motif_interdiction = models.TextField(
        verbose_name="Motif d'interdiction",
        help_text="Raison sanitaire de l'interdiction",
    )
    date_interdiction = models.DateField(
        verbose_name="Date d'interdiction",
        help_text="Date du communiqué ABMed",
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name = "Produit interdit (ABMed)"
        verbose_name_plural = "Produits interdits (ABMed)"
        ordering = ["-date_interdiction", "nom_produit"]

    def __str__(self):
        return f"⛔ {self.marque} - {self.nom_produit} (interdit)"


# ============================================================
# SIGNALEMENT EFFETS INDÉSIRABLES — Obligation ABMed
# ============================================================
class SignalementEffetIndesirable(TimeStampedModel):
    """
    Signalement d'un effet indésirable d'un produit cosmétique.
    Obligation réglementaire ABMed — doit être transmis à l'agence.
    """
    GRAVITE_CHOICES = [
        ("LEGER", "Léger"),
        ("MODERE", "Modéré"),
        ("GRAVE", "Grave"),
        ("TRES_GRAVE", "Très grave"),
    ]

    STATUT_CHOICES = [
        ("NOUVEAU", "Nouveau"),
        ("EN_COURS", "En cours d'examen"),
        ("TRANSMIS_ABMED", "Transmis à l'ABMed"),
        ("CLOTURE", "Clôturé"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(
        Produit,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="signalements",
        verbose_name="Produit concerné",
    )
    nom_produit_signale = models.CharField(
        max_length=255,
        verbose_name="Nom du produit signalé",
        help_text="Si le produit n'est pas dans le catalogue",
    )
    email_signalant = models.EmailField(
        verbose_name="Email du signalant",
    )
    telephone_signalant = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Téléphone du signalant",
    )
    description = models.TextField(
        verbose_name="Description de l'effet indésirable",
    )
    gravite = models.CharField(
        max_length=15,
        choices=GRAVITE_CHOICES,
        default="LEGER",
        verbose_name="Gravité",
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default="NOUVEAU",
        db_index=True,
    )
    transmis_abmed = models.BooleanField(
        default=False,
        verbose_name="Transmis à l'ABMed",
    )
    date_transmission_abmed = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de transmission ABMed",
    )

    class Meta:
        verbose_name = "Signalement effet indésirable"
        verbose_name_plural = "Signalements effets indésirables"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Signalement #{str(self.id)[:8]} — {self.nom_produit_signale} ({self.gravite})"
