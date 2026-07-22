"""
Migration : Ajout des champs réglementaires ABMed sur Produit
+ Création des modèles ProduitInterdit et SignalementEffetIndesirable
Conformité : Arrêté du 18/01/2022 + Communiqué ABMed du 05/05/2026
"""
import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0006_fix_categorie_indexes"),
    ]

    operations = [
        # ─── Champs réglementaires sur Produit ───
        migrations.AddField(
            model_name="produit",
            name="amm_number",
            field=models.CharField(
                blank=True,
                max_length=100,
                verbose_name="N° AMM",
                help_text="Numéro d'autorisation de mise sur le marché (ABMed)",
            ),
        ),
        migrations.AddField(
            model_name="produit",
            name="liste_inci",
            field=models.TextField(
                blank=True,
                verbose_name="Liste INCI",
                help_text="Liste complète des ingrédients (nomenclature INCI)",
            ),
        ),
        migrations.AddField(
            model_name="produit",
            name="pays_origine",
            field=models.CharField(
                blank=True,
                max_length=100,
                verbose_name="Pays d'origine",
                help_text="Pays de fabrication du produit",
            ),
        ),
        migrations.AddField(
            model_name="produit",
            name="date_peremption",
            field=models.DateField(
                blank=True,
                null=True,
                verbose_name="Date de péremption",
                help_text="Date limite d'utilisation (si applicable)",
            ),
        ),
        migrations.AddField(
            model_name="produit",
            name="numero_lot",
            field=models.CharField(
                blank=True,
                max_length=100,
                verbose_name="Numéro de lot",
                help_text="Numéro de lot du fabricant pour traçabilité",
            ),
        ),
        # ─── Modèle ProduitInterdit (liste noire ABMed) ───
        migrations.CreateModel(
            name="ProduitInterdit",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("nom_produit", models.CharField(db_index=True, max_length=255, verbose_name="Nom du produit interdit")),
                ("marque", models.CharField(blank=True, db_index=True, max_length=150, verbose_name="Marque")),
                ("substance_dangereuse", models.CharField(blank=True, max_length=255, verbose_name="Substance dangereuse")),
                ("motif_interdiction", models.TextField(verbose_name="Motif d'interdiction")),
                ("date_interdiction", models.DateField(verbose_name="Date d'interdiction")),
                ("is_active", models.BooleanField(db_index=True, default=True)),
            ],
            options={
                "verbose_name": "Produit interdit (ABMed)",
                "verbose_name_plural": "Produits interdits (ABMed)",
                "ordering": ["-date_interdiction", "nom_produit"],
            },
        ),
        # ─── Modèle SignalementEffetIndesirable ───
        migrations.CreateModel(
            name="SignalementEffetIndesirable",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("nom_produit_signale", models.CharField(max_length=255, verbose_name="Nom du produit signalé")),
                ("email_signalant", models.EmailField(max_length=254, verbose_name="Email du signalant")),
                ("telephone_signalant", models.CharField(blank=True, max_length=20, verbose_name="Téléphone du signalant")),
                ("description", models.TextField(verbose_name="Description de l'effet indésirable")),
                ("gravite", models.CharField(choices=[("LEGER", "Léger"), ("MODERE", "Modéré"), ("GRAVE", "Grave"), ("TRES_GRAVE", "Très grave")], default="LEGER", max_length=15, verbose_name="Gravité")),
                ("statut", models.CharField(choices=[("NOUVEAU", "Nouveau"), ("EN_COURS", "En cours d'examen"), ("TRANSMIS_ABMED", "Transmis à l'ABMed"), ("CLOTURE", "Clôturé")], db_index=True, default="NOUVEAU", max_length=20, verbose_name="Statut")),
                ("transmis_abmed", models.BooleanField(default=False, verbose_name="Transmis à l'ABMed")),
                ("date_transmission_abmed", models.DateTimeField(blank=True, null=True, verbose_name="Date de transmission ABMed")),
                ("produit", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="signalements", to="catalog.produit", verbose_name="Produit concerné")),
            ],
            options={
                "verbose_name": "Signalement effet indésirable",
                "verbose_name_plural": "Signalements effets indésirables",
                "ordering": ["-created_at"],
            },
        ),
    ]
