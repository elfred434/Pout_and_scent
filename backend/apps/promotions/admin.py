from django.contrib import admin
from .models import Promotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ("nom", "type", "valeur", "date_debut", "date_fin", "is_active")
    list_filter = ("type", "is_active")
    search_fields = ("nom", "code")
    list_editable = ("is_active",)