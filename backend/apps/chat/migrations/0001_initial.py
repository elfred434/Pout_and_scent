"""
Migration initiale pour le module Chat — Pout & Scent
Crée les tables Conversation et Message.
"""
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Conversation",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("sujet", models.CharField(help_text="Sujet ou première ligne du message", max_length=255, verbose_name="Sujet de la conversation")),
                ("statut", models.CharField(choices=[("OUVERTE", "Ouverte"), ("EN_COURS", "En cours (prise en charge)"), ("RESOLUE", "Résolue"), ("FERMEE", "Fermée")], db_index=True, default="OUVERTE", max_length=20)),
                ("priorite", models.CharField(choices=[("BASSE", "Basse"), ("MOYENNE", "Moyenne"), ("HAUTE", "Haute"), ("URGENTE", "Urgente")], db_index=True, default="MOYENNE", max_length=10)),
                ("date_dernier_message", models.DateTimeField(auto_now_add=True, db_index=True, verbose_name="Date du dernier message")),
                ("is_closed", models.BooleanField(db_index=True, default=False, verbose_name="Fermée")),
                ("client", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="conversations", to=settings.AUTH_USER_MODEL, verbose_name="Client")),
                ("agent_support", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="conversations_assignees", to=settings.AUTH_USER_MODEL, verbose_name="Agent support assigné")),
            ],
            options={
                "verbose_name": "Conversation",
                "verbose_name_plural": "Conversations",
                "ordering": ["-date_dernier_message"],
            },
        ),
        migrations.CreateModel(
            name="Message",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("type_message", models.CharField(choices=[("CLIENT", "Client"), ("AGENT", "Agent support"), ("SYSTEM", "Système")], db_index=True, default="CLIENT", max_length=10)),
                ("contenu", models.TextField(verbose_name="Contenu du message")),
                ("is_read", models.BooleanField(db_index=True, default=False, verbose_name="Lu")),
                ("date_read", models.DateTimeField(blank=True, null=True, verbose_name="Date de lecture")),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True, verbose_name="Adresse IP")),
                ("auteur", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="messages_envoyes", to=settings.AUTH_USER_MODEL, verbose_name="Auteur")),
                ("conversation", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="messages", to="chat.conversation", verbose_name="Conversation")),
            ],
            options={
                "verbose_name": "Message",
                "verbose_name_plural": "Messages",
                "ordering": ["created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="conversation",
            index=models.Index(fields=["client", "-date_dernier_message"], name="chat_conver_client__a8e8a4_idx"),
        ),
        migrations.AddIndex(
            model_name="conversation",
            index=models.Index(fields=["statut", "-date_dernier_message"], name="chat_conver_statut__e6e5e0_idx"),
        ),
        migrations.AddIndex(
            model_name="conversation",
            index=models.Index(fields=["agent_support", "statut"], name="chat_conver_agent_s_f5b7e1_idx"),
        ),
        migrations.AddIndex(
            model_name="message",
            index=models.Index(fields=["conversation", "-created_at"], name="chat_messag_convers_5a1b4e_idx"),
        ),
        migrations.AddIndex(
            model_name="message",
            index=models.Index(fields=["type_message", "is_read"], name="chat_messag_type_me_8c3f2a_idx"),
        ),
    ]
