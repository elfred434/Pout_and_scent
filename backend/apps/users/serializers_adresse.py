from rest_framework import serializers
from .models import Adresse

class AdresseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adresse
        fields = ("id", "libelle", "ville", "quartier", "indications", "telephone_contact", "is_default")
    def create(self, validated_data):
        if validated_data.get("is_default"):
            Adresse.objects.filter(user=validated_data["user"], is_default=True).update(is_default=False)
            
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if validated_data.get("is_default"):
            Adresse.objects.filter(user=instance.user, is_default=True).exclude(pk=instance.pk).update(is_default=False)
        return super().update(instance, validated_data)
    