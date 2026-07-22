from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Adresse


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "role", "is_2fa_enabled", "is_active", "created_at")
    list_filter = ("role", "is_2fa_enabled", "is_active", "is_staff")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-created_at",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Informations", {"fields": ("first_name", "last_name", "role", "is_2fa_enabled", "google_id")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2", "role")}),
    )


@admin.register(Adresse)
class AdresseAdmin(admin.ModelAdmin):
    list_display = ("libelle", "user", "ville", "quartier", "is_default")
    list_filter = ("ville", "is_default")
    search_fields = ("user__email", "ville", "quartier")