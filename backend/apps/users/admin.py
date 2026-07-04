from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Adresse


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "role", "is_2fa_enabled", "is_active", "created_at")
    list_filter = ("role", "is_2fa_enabled", "is_active", "is_staff", "created_at")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-created_at",)
    
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Informations personnelles", {"fields": ("first_name", "last_name", "google_id")}),
        ("Sécurité", {"fields": ("role", "is_2fa_enabled")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates importantes", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "password1", "password2", "role", "is_2fa_enabled"),
        }),
    )
    
    readonly_fields = ("created_at", "updated_at", "last_login")
    
    actions = ["enable_2fa", "disable_2fa", "export_emails"]
    
    @admin.action(description="Activer 2FA pour les sélectionnés")
    def enable_2fa(self, request, queryset):
        count = queryset.update(is_2fa_enabled=True)
        self.message_user(request, f"{count} utilisateur(s) mis à jour.")
    
    @admin.action(description="Désactiver 2FA pour les sélectionnés")
    def disable_2fa(self, request, queryset):
        count = queryset.update(is_2fa_enabled=False)
        self.message_user(request, f"{count} utilisateur(s) mis à jour.")
    
    @admin.action(description="Exporter emails")
    def export_emails(self, request, queryset):
        emails = list(queryset.values_list("email", flat=True))
        self.message_user(request, f"{len(emails)} email(s) exporté(s): {', '.join(emails[:10])}")


@admin.register(Adresse)
class AdresseAdmin(admin.ModelAdmin):
    list_display = ("libelle", "user", "ville", "quartier", "is_default", "created_at")
    list_filter = ("ville", "is_default", "created_at")
    search_fields = ("user__email", "user__first_name", "user__last_name", "ville", "quartier")
    readonly_fields = ("created_at", "updated_at")