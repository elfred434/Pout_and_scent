"""
Seed data : Liste noire ABMed — 12 produits principaux interdits
Communiqué ABMed du 5 mai 2026
Usage : python manage.py shell -c "from apps.catalog.seed_produits_interdits import seed; seed()"
"""
from datetime import date


PRODUITS_INTERDITS_ABMED = [
    {
        "nom_produit": "Epiderm Crème",
        "marque": "Epiderm",
        "substance_dangereuse": "Corticoïdes",
        "motif_interdiction": "Contient des corticoïdes prohibés fragilisant la barrière cutanée. Risque d'infections, troubles pigmentaires et lésions cutanées graves.",
    },
    {
        "nom_produit": "Dermaclair",
        "marque": "Dermaclair",
        "substance_dangereuse": "Corticoïdes, Hydroquinone",
        "motif_interdiction": "Substances dépigmentantes dangereuses. Risque de cancer cutané et lésions sévères.",
    },
    {
        "nom_produit": "Movate",
        "marque": "Movate",
        "substance_dangereuse": "Corticoïdes",
        "motif_interdiction": "Corticoïdes prohibés. Risque d'infections cutanées et troubles pigmentaires.",
    },
    {
        "nom_produit": "Caro Light",
        "marque": "Caro Light",
        "substance_dangereuse": "Corticoïdes, Hydroquinone",
        "motif_interdiction": "Substances éclaircissantes dangereuses. Risque de cancer de la peau.",
    },
    {
        "nom_produit": "Clobetaderm White Cream",
        "marque": "Clobetaderm",
        "substance_dangereuse": "Corticoïdes",
        "motif_interdiction": "Corticoïdes à haute dose. Fragilise la barrière cutanée.",
    },
    {
        "nom_produit": "Coco Pulp",
        "marque": "Coco Pulp",
        "substance_dangereuse": "Corticoïdes, Mercure",
        "motif_interdiction": "Substances toxiques multiples. Risque de lésions irréversibles et cancer cutané.",
    },
    {
        "nom_produit": "Fair & White",
        "marque": "Fair & White",
        "substance_dangereuse": "Hydroquinone, Corticoïdes",
        "motif_interdiction": "Substances dépigmentantes prohibées. Risque de troubles pigmentaires sévères.",
    },
    {
        "nom_produit": "Dermovate",
        "marque": "Dermovate",
        "substance_dangereuse": "Corticoïdes (Clobetasol)",
        "motif_interdiction": "Corticoïde ultra-puissant. Risque d'atrophie cutanée et infections.",
    },
    {
        "nom_produit": "Skin Light",
        "marque": "Skin Light",
        "substance_dangereuse": "Hydroquinone",
        "motif_interdiction": "Hydroquinone à concentration prohibée. Risque d'ochronose et cancer.",
    },
    {
        "nom_produit": "Rapid Clair",
        "marque": "Rapid Clair",
        "substance_dangereuse": "Corticoïdes, Hydroquinone",
        "motif_interdiction": "Substances éclaircissantes dangereuses. Lésions cutanées graves.",
    },
    {
        "nom_produit": "Abidjanaise",
        "marque": "Abidjanaise",
        "substance_dangereuse": "Corticoïdes",
        "motif_interdiction": "Produit dépigmentant contenant des corticoïdes. Risque sanitaire majeur.",
    },
    {
        "nom_produit": "Glutanex Injectable",
        "marque": "Glutanex",
        "substance_dangereuse": "Glutathion injectable",
        "motif_interdiction": "Produit injectable non autorisé. Risque de réactions allergiques graves et dommages rénaux.",
    },
    {
        "nom_produit": "Caro White",
        "marque": "Caro White",
        "substance_dangereuse": "Corticoïdes, Hydroquinone",
        "motif_interdiction": "Substances dépigmentantes prohibées. Risque de cancer cutané.",
    },
    {
        "nom_produit": "Clinic Clear",
        "marque": "Clinic Clear",
        "substance_dangereuse": "Corticoïdes",
        "motif_interdiction": "Corticoïdes prohibés. Fragilisation cutanée et infections.",
    },
    {
        "nom_produit": "Rapid White",
        "marque": "Rapid White",
        "substance_dangereuse": "Hydroquinone, Mercure",
        "motif_interdiction": "Substances toxiques. Risque de dommages rénaux et cutanés irréversibles.",
    },
]


def seed():
    """Insère les produits interdits ABMed dans la base de données."""
    from apps.catalog.models import ProduitInterdit

    date_interdiction = date(2026, 5, 5)
    created = 0
    for data in PRODUITS_INTERDITS_ABMED:
        _, was_created = ProduitInterdit.objects.get_or_create(
            nom_produit=data["nom_produit"],
            defaults={
                "marque": data["marque"],
                "substance_dangereuse": data["substance_dangereuse"],
                "motif_interdiction": data["motif_interdiction"],
                "date_interdiction": date_interdiction,
                "is_active": True,
            },
        )
        if was_created:
            created += 1

    print(f"✅ {created} produit(s) interdit(s) ABMed ajouté(s) ({len(PRODUITS_INTERDITS_ABMED)} au total)")
