"""
Middleware JWT pour l'authentification WebSocket — Pout & Scent
Permet aux clients de s'authentifier via le query string : ws://host/ws/chat/xxx/?token=<jwt>
"""
import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token: str):
    """Récupère l'utilisateur à partir d'un token JWT."""
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth import get_user_model

        User = get_user_model()
        validated_token = AccessToken(token)
        user_id = validated_token["user_id"]
        return User.objects.get(id=user_id)
    except Exception as e:
        logger.warning("Token JWT WebSocket invalide : %s", e)
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware pour authentifier les connexions WebSocket via JWT.
    Le token est passé dans le query string : ?token=<jwt_access_token>
    """

    async def __call__(self, scope, receive, send):
        # Récupérer le token du query string
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
