from decimal import Decimal, ROUND_HALF_UP
from django.utils import timezone
from .models import Promotion, TypePromotion


class PricingService:
    @staticmethod
    def promotion_active(variante) -> Promotion | None:
        now = timezone.now()
        qs = Promotion.objects.filter(
            is_active=True, date_debut__lte=now, date_fin__gte=now
        )
        promo = qs.filter(produit=variante.produit).order_by("-valeur").first()
        if promo:
            return promo
        return qs.filter(categorie=variante.produit.categorie).order_by("-valeur").first()

    @classmethod
    def prix_final(cls, variante) -> Decimal:
        promo = cls.promotion_active(variante)
        prix = variante.prix
        if not promo:
            return prix.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if promo.type == TypePromotion.POURCENTAGE:
            prix = prix * (Decimal("1") - promo.valeur / Decimal("100"))
        else:
            prix = prix - promo.valeur
        if prix < 0:
            prix = Decimal("0")
        return prix.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)