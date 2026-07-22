"""
Serializers pour le module Chat — Pout & Scent
"""
from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    auteur_email = serializers.SerializerMethodField()
    auteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            "id",
            "conversation",
            "auteur",
            "auteur_email",
            "auteur_nom",
            "type_message",
            "contenu",
            "is_read",
            "date_read",
            "created_at",
        )
        read_only_fields = ("id", "auteur", "created_at", "date_read")

    def get_auteur_email(self, obj):
        return obj.auteur.email if obj.auteur else "Système"

    def get_auteur_nom(self, obj):
        return obj.auteur.full_name if obj.auteur else "Système"


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des conversations."""
    client_email = serializers.SerializerMethodField()
    client_nom = serializers.SerializerMethodField()
    agent_nom = serializers.SerializerMethodField()
    dernier_message = serializers.SerializerMethodField()
    nb_messages_non_lus = serializers.ReadOnlyField()

    class Meta:
        model = Conversation
        fields = (
            "id",
            "client",
            "client_email",
            "client_nom",
            "sujet",
            "statut",
            "priorite",
            "agent_support",
            "agent_nom",
            "date_dernier_message",
            "dernier_message",
            "nb_messages_non_lus",
            "is_closed",
            "created_at",
        )
        read_only_fields = ("id", "client", "date_dernier_message", "created_at")

    def get_client_email(self, obj):
        return obj.client.email

    def get_client_nom(self, obj):
        return obj.client.full_name

    def get_agent_nom(self, obj):
        return obj.agent_support.full_name if obj.agent_support else None

    def get_dernier_message(self, obj):
        msg = obj.dernier_message
        if msg:
            return {
                "contenu": msg.contenu[:100],
                "type_message": msg.type_message,
                "created_at": msg.created_at.isoformat(),
            }
        return None


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Serializer pour le détail d'une conversation avec ses messages."""
    messages = MessageSerializer(many=True, read_only=True)
    client_email = serializers.SerializerMethodField()
    client_nom = serializers.SerializerMethodField()
    agent_nom = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            "id",
            "client",
            "client_email",
            "client_nom",
            "sujet",
            "statut",
            "priorite",
            "agent_support",
            "agent_nom",
            "date_dernier_message",
            "is_closed",
            "messages",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "client", "created_at", "updated_at")

    def get_client_email(self, obj):
        return obj.client.email

    def get_client_nom(self, obj):
        return obj.client.full_name

    def get_agent_nom(self, obj):
        return obj.agent_support.full_name if obj.agent_support else None


class CreateConversationSerializer(serializers.ModelSerializer):
    """Serializer pour créer une nouvelle conversation."""
    message_initial = serializers.CharField(
        write_only=True,
        required=True,
        max_length=2000,
        help_text="Premier message de la conversation",
    )

    class Meta:
        model = Conversation
        fields = ("id", "sujet", "priorite", "message_initial")
        read_only_fields = ("id",)

    def create(self, validated_data):
        message_initial = validated_data.pop("message_initial")
        user = self.context["request"].user

        # Créer la conversation
        conversation = Conversation.objects.create(
            client=user,
            **validated_data,
        )

        # Créer le premier message
        Message.objects.create(
            conversation=conversation,
            auteur=user,
            type_message=Message.TYPE_CLIENT,
            contenu=message_initial,
        )

        return conversation


class SendMessageSerializer(serializers.Serializer):
    """Serializer pour envoyer un message via REST."""
    contenu = serializers.CharField(max_length=2000)

    def create(self, validated_data):
        user = self.context["request"].user
        conversation = self.context["conversation"]

        is_agent = user.role == "ADMIN"
        msg_type = Message.TYPE_AGENT if is_agent else Message.TYPE_CLIENT

        return Message.objects.create(
            conversation=conversation,
            auteur=user,
            type_message=msg_type,
            contenu=validated_data["contenu"],
        )
