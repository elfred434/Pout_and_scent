"""
Vues REST pour le module Chat — Pout & Scent
Endpoints pour gérer les conversations et l'historique des messages.
"""
import logging

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsAdminRole
from .models import Conversation, Message, StatutConversation
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    CreateConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
)

logger = logging.getLogger(__name__)


class ConversationViewSet(viewsets.ModelViewSet):
    """
    CRUD des conversations de chat.
    - Client : voit uniquement ses propres conversations
    - Admin : voit toutes les conversations
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateConversationSerializer
        if self.action == "retrieve":
            return ConversationDetailSerializer
        return ConversationListSerializer

    def get_queryset(self):
        qs = Conversation.objects.select_related(
            "client", "agent_support"
        ).prefetch_related("messages")

        # Client : uniquement ses conversations
        if self.request.user.role != "ADMIN":
            qs = qs.filter(client=self.request.user)

        # Filtres optionnels
        statut = self.request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)

        is_closed = self.request.query_params.get("is_closed")
        if is_closed is not None:
            qs = qs.filter(is_closed=is_closed.lower() == "true")

        return qs

    def perform_create(self, serializer):
        """Crée une nouvelle conversation avec le premier message."""
        conversation = serializer.save()
        logger.info(
            "Nouvelle conversation #%s créée par %s — sujet: %s",
            conversation.id,
            self.request.user.email,
            conversation.sujet,
        )

        # Notifier les agents support (si Channels est configuré)
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    "support_agents",
                    {
                        "type": "new_conversation",
                        "conversation": {
                            "id": str(conversation.id),
                            "client_email": conversation.client.email,
                            "sujet": conversation.sujet,
                            "statut": conversation.statut,
                            "priorite": conversation.priorite,
                            "created_at": conversation.created_at.isoformat(),
                        },
                    },
                )
        except Exception as e:
            logger.warning("Impossible de notifier les agents support : %s", e)

    @action(detail=True, methods=["post"], url_path="send")
    def send_message(self, request, pk=None):
        """Envoyer un message dans une conversation via REST."""
        conversation = self.get_object()

        # Vérifier les permissions
        if request.user.role != "ADMIN" and conversation.client != request.user:
            return Response(
                {"error": "Permission refusée"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if conversation.is_closed:
            return Response(
                {"error": "Cette conversation est fermée"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = SendMessageSerializer(
            data=request.data,
            context={"request": request, "conversation": conversation},
        )
        serializer.is_valid(raise_exception=True)
        message = serializer.save()

        # Mettre à jour la date du dernier message
        conversation.date_dernier_message = timezone.now()
        conversation.save(update_fields=["date_dernier_message"])

        logger.info(
            "Message envoyé dans conversation #%s par %s",
            conversation.id,
            request.user.email,
        )

        # Tenter d'envoyer via WebSocket aussi
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"chat_{conversation.id}",
                    {
                        "type": "chat_message",
                        "message": {
                            "id": str(message.id),
                            "conversation_id": str(conversation.id),
                            "auteur_id": str(request.user.id),
                            "auteur_email": request.user.email,
                            "auteur_nom": request.user.full_name,
                            "type_message": message.type_message,
                            "contenu": message.contenu,
                            "is_read": False,
                            "created_at": message.created_at.isoformat(),
                        },
                    },
                )
        except Exception as e:
            logger.warning("Impossible d'envoyer via WebSocket : %s", e)

        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="close")
    def close_conversation(self, request, pk=None):
        """Fermer une conversation."""
        conversation = self.get_object()

        # Seuls l'admin ou le client propriétaire peuvent fermer
        if request.user.role != "ADMIN" and conversation.client != request.user:
            return Response(
                {"error": "Permission refusée"},
                status=status.HTTP_403_FORBIDDEN,
            )

        conversation.is_closed = True
        conversation.statut = StatutConversation.FERMEE
        conversation.save()

        logger.info(
            "Conversation #%s fermée par %s",
            conversation.id,
            request.user.email,
        )

        return Response(ConversationListSerializer(conversation).data)

    @action(detail=True, methods=["post"], url_path="assign")
    def assign_agent(self, request, pk=None):
        """Assigner un agent support à la conversation (admin uniquement)."""
        if not IsAdminRole().has_permission(request, self):
            return Response(
                {"error": "Permission refusée"},
                status=status.HTTP_403_FORBIDDEN,
            )

        conversation = self.get_object()
        conversation.agent_support = request.user
        conversation.statut = StatutConversation.EN_COURS
        conversation.save()

        logger.info(
            "Conversation #%s assignée à %s",
            conversation.id,
            request.user.email,
        )

        return Response(ConversationListSerializer(conversation).data)

    @action(detail=True, methods=["post"], url_path="resolve")
    def resolve_conversation(self, request, pk=None):
        """Marquer une conversation comme résolue (admin uniquement)."""
        if not IsAdminRole().has_permission(request, self):
            return Response(
                {"error": "Permission refusée"},
                status=status.HTTP_403_FORBIDDEN,
            )

        conversation = self.get_object()
        conversation.statut = StatutConversation.RESOLUE
        conversation.save()

        logger.info(
            "Conversation #%s marquée comme résolue par %s",
            conversation.id,
            request.user.email,
        )

        return Response(ConversationListSerializer(conversation).data)

    @action(detail=True, methods=["get"], url_path="messages")
    def get_messages(self, request, pk=None):
        """Récupérer l'historique des messages d'une conversation."""
        conversation = self.get_object()
        messages = conversation.messages.select_related("auteur").order_by("created_at")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_as_read(self, request, pk=None):
        """Marquer tous les messages comme lus."""
        conversation = self.get_object()

        Message.objects.filter(
            conversation=conversation,
            is_read=False,
        ).exclude(auteur=request.user).update(
            is_read=True,
            date_read=timezone.now(),
        )

        return Response({"success": True})
