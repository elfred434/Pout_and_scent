import uuid
from django.conf import settings
from django.db import models
from apps.common.models import BaseModel  # ✅ CHANGÉ : BaseModel


class Avis(BaseModel):  # ✅ CHANGÉ : BaseModel
    # Plus besoin de redéclarer id
    produit = models.ForeignKey("catalog.Produit", on_delete=models.CASCADE, related_name="avis")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="avis")
    note = models.PositiveSmallIntegerField()
    commentaire = models.TextField(blank=True)
    is_visible = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name = "Avis"  # ✅ ESPACE SUPPRIMÉ
        verbose_name_plural = "Avis"  # ✅ ESPACE SUPPRIMÉ
        constraints = [
            models.UniqueConstraint(fields=["produit", "user"], name="un_avis_par_user_produit"),  # ✅ ESPACE SUPPRIMÉ
            models.CheckConstraint(check=models.Q(note__gte=1, note__lte=5), name="note_entre_1_et_5"),  # ✅ ESPACE SUPPRIMÉ
        ]
        indexes = [models.Index(fields=["produit", "is_visible"])]

    def __str__(self):
        return f"{self.user.email} - {self.note}/5 sur {self.produit_id}"