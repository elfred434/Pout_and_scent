import uuid
from django.db import models


class TimeStampedModel(models.Model):
    """Modèle abstrait avec created_at et updated_at."""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """Modèle abstrait avec UUID en primary key."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class BaseModel(UUIDModel, TimeStampedModel):
    """Modèle de base combinant UUID + timestamps.
    À utiliser pour TOUS les modèles métier."""

    class Meta:
        abstract = True