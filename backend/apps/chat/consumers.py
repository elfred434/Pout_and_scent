"""
Consumers WebSocket pour le chat en direct — Pout & Scent
Utilise Django Channels pour gérer les connexions temps réel.
"""
import json
import logging
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket pour les conversations client.
    Chaque client se connecte à sa propre conversation.
    """

    async def connect(self):
        """Appelé quand un client se connecte."""
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.room_group_name = f"chat_{self.conversation_id}"
        self.user = self.scope.get("user")

        # Vérifier l'authentification
        if not self.user or self.user.is_anonymous:
            logger.warning("Tentative de connexion WebSocket non authentifiée")
            await self.close()
            return

        # Vérifier que l'utilisateur a accès à cette conversation
        has_access = await self.check_access()
        if not has_access:
            logger.warning(
                "Accès refusé à la conversation %s pour %s",
                self.conversation_id,
                self.user.email,
            )
            await self.close()
            return

        # Rejoindre le groupe de la conversation
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()
        logger.info(
            "Client %s connecté à la conversation %s",
            self.user.email,
            self.conversation_id,
        )

        # Envoyer un message système de bienvenue
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "system_message",
                "message": f"{self.user.email} a rejoint la conversation",
            },
        )

    async def disconnect(self, close_code):
        """Appelé quand un client se déconnecte."""
        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

        if hasattr(self, "user") and self.user and not self.user.is_anonymous:
            logger.info(
                "Client %s déconnecté de la conversation %s",
                self.user.email,
                self.conversation_id,
            )

    async def receive(self, text_data):
        """
        Reçoit un message du client WebSocket.
        Format attendu : {"type": "message", "contenu": "..."}
        """
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send_error("Format JSON invalide")
            return

        message_type = data.get("type", "message")

        if message_type == "message":
            contenu = data.get("contenu", "").strip()
            if not contenu:
                await self.send_error("Le message ne peut pas être vide")
                return

            # Vérifier la longueur
            if len(contenu) > 2000:
                await self.send_error("Le message ne peut pas dépasser 2000 caractères")
                return

            # Sauvegarder le message en base
            message = await self.save_message(contenu)

            # Déterminer le type de message (client ou agent)
            is_agent = await self.is_agent()
            msg_type = "AGENT" if is_agent else "CLIENT"

            # Envoyer à tous dans le groupe
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": {
                        "id": str(message["id"]),
                        "conversation_id": str(self.conversation_id),
                        "auteur_id": str(self.user.id),
                        "auteur_email": self.user.email,
                        "auteur_nom": self.user.full_name,
                        "type_message": msg_type,
                        "contenu": contenu,
                        "is_read": False,
                        "created_at": message["created_at"],
                    },
                },
            )

            # Mettre à jour la date du dernier message
            await self.update_conversation_last_message()

        elif message_type == "typing":
            # Indicateur de frappe
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_indicator",
                    "user_id": str(self.user.id),
                    "user_email": self.user.email,
                    "is_typing": data.get("is_typing", True),
                },
            )

        elif message_type == "read":
            # Marquer les messages comme lus
            message_ids = data.get("message_ids", [])
            await self.mark_messages_read(message_ids)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "messages_read",
                    "user_id": str(self.user.id),
                    "message_ids": message_ids,
                },
            )

    # ============================================================
    # Handlers de messages de groupe
    # ============================================================

    async def chat_message(self, event):
        """Envoie un message de chat au WebSocket."""
        await self.send(text_data=json.dumps({
            "type": "message",
            "data": event["message"],
        }))

    async def system_message(self, event):
        """Envoie un message système au WebSocket."""
        await self.send(text_data=json.dumps({
            "type": "system",
            "data": {
                "message": event["message"],
                "timestamp": timezone.now().isoformat(),
            },
        }))

    async def typing_indicator(self, event):
        """Envoie l'indicateur de frappe au WebSocket."""
        # Ne pas envoyer à soi-même
        if event["user_id"] != str(self.user.id):
            await self.send(text_data=json.dumps({
                "type": "typing",
                "data": {
                    "user_id": event["user_id"],
                    "user_email": event["user_email"],
                    "is_typing": event["is_typing"],
                },
            }))

    async def messages_read(self, event):
        """Notifie que des messages ont été lus."""
        if event["user_id"] != str(self.user.id):
            await self.send(text_data=json.dumps({
                "type": "read_receipt",
                "data": {
                    "user_id": event["user_id"],
                    "message_ids": event["message_ids"],
                },
            }))

    # ============================================================
    # Méthodes utilitaires
    # ============================================================

    async def send_error(self, message: str):
        """Envoie un message d'erreur au client."""
        await self.send(text_data=json.dumps({
            "type": "error",
            "data": {"message": message},
        }))

    @database_sync_to_async
    def check_access(self):
        """Vérifie que l'utilisateur a accès à la conversation."""
        from .models import Conversation

        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            # Le client propriétaire ou un admin/agent peut accéder
            if conversation.client == self.user:
                return True
            if self.user.role == "ADMIN":
                return True
            if conversation.agent_support == self.user:
                return True
            return False
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def is_agent(self):
        """Vérifie si l'utilisateur est un agent support."""
        return self.user.role == "ADMIN"

    @database_sync_to_async
    def save_message(self, contenu: str):
        """Sauvegarde un message en base de données."""
        from .models import Message, Conversation

        is_agent = self.user.role == "ADMIN"
        msg_type = Message.TYPE_AGENT if is_agent else Message.TYPE_CLIENT

        # Récupérer l'IP
        ip = None
        if "client" in self.scope:
            ip = self.scope["client"][0]

        message = Message.objects.create(
            conversation_id=self.conversation_id,
            auteur=self.user,
            type_message=msg_type,
            contenu=contenu,
            ip_address=ip,
        )

        return {
            "id": str(message.id),
            "created_at": message.created_at.isoformat(),
        }

    @database_sync_to_async
    def update_conversation_last_message(self):
        """Met à jour la date du dernier message de la conversation."""
        from .models import Conversation

        Conversation.objects.filter(id=self.conversation_id).update(
            date_dernier_message=timezone.now()
        )

    @database_sync_to_async
    def mark_messages_read(self, message_ids: list):
        """Marque des messages comme lus."""
        from .models import Message

        Message.objects.filter(
            id__in=message_ids,
            conversation_id=self.conversation_id,
        ).exclude(auteur=self.user).update(
            is_read=True,
            date_read=timezone.now(),
        )


class SupportConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket pour les agents support.
    Permet de recevoir les notifications de nouvelles conversations.
    """

    async def connect(self):
        """Connexion d'un agent support."""
        self.user = self.scope.get("user")

        if not self.user or self.user.is_anonymous:
            await self.close()
            return

        if self.user.role != "ADMIN":
            logger.warning(
                "Tentative de connexion support par un non-admin : %s",
                self.user.email,
            )
            await self.close()
            return

        self.group_name = "support_agents"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()
        logger.info("Agent support connecté : %s", self.user.email)

    async def disconnect(self, close_code):
        """Déconnexion d'un agent support."""
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        """Réception de messages de l'agent (assignation, etc.)."""
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        action = data.get("action")

        if action == "assign":
            # S'assigner une conversation
            conversation_id = data.get("conversation_id")
            await self.assign_conversation(conversation_id)

    async def new_conversation(self, event):
        """Notification de nouvelle conversation."""
        await self.send(text_data=json.dumps({
            "type": "new_conversation",
            "data": event["conversation"],
        }))

    async def conversation_update(self, event):
        """Notification de mise à jour de conversation."""
        await self.send(text_data=json.dumps({
            "type": "conversation_update",
            "data": event["conversation"],
        }))

    @database_sync_to_async
    def assign_conversation(self, conversation_id):
        """Assigner une conversation à l'agent courant."""
        from .models import Conversation, StatutConversation

        try:
            Conversation.objects.filter(id=conversation_id).update(
                agent_support=self.user,
                statut=StatutConversation.EN_COURS,
            )
            logger.info(
                "Conversation %s assignée à %s",
                conversation_id,
                self.user.email,
            )
        except Exception as e:
            logger.error("Erreur assignation conversation : %s", e)
