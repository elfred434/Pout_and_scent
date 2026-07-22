"""
Migration : Ajout de l'index type+is_active sur Categorie.
Le GinIndex invalide sur Categorie.nom a déjà été corrigé dans 0001_initial.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0005_alter_contenance_and_search_vector"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="categorie",
            index=models.Index(fields=["type", "is_active"], name="catalog_cat_type_is_ac_idx"),
        ),
    ]
