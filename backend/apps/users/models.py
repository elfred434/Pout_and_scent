import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from apps.common.models import TimeStampedModel


class Role(models.TextChoices):
    ADMIN = "ADMIN", "Administrateur"
    CLIENT = "CLIENT", "Client"
    
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("role", Role.ADMIN)
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra)
    
class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField("Prénom", max_length=100, blank=True)
    last_name = models.CharField("Nom", max_length=100, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.CLIENT, db_index=True)
    is_2fa_enabled = models.BooleanField(default=False)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        indexes = [
            models.Index(fields=["role", "is_active"]),
            models.Index(fields=["-date_joined"]),
            
        ]
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email
class Adresse(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="adresses")
    libelle = models.CharField(max_length=155)
    ville = models.CharField(max_length=100)
    quartier = models.CharField(max_length=200)
    indications = models.TextField(blank=True)
    telephone_contact = models.CharField(max_length=20)
    is_default = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Adresse"
        verbose_name_plural = "Adresses"
        constraints = [
            models.UniqueConstraint(
                fields=["user"], condition=models.Q(is_default=True),
                name="unique_default_adresse_per_user"
            )
        ]
        indexes = [models.Index(fields=["user", "is_default"])]

    def __str__(self):
        return f"{self.libelle} - {self.quartier}, {self.ville}"