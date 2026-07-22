/**
 * Hook useChatWebSocket — Pout & Scent
 * Gère la connexion WebSocket temps réel pour le chat.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { getAccessToken } from '@/lib/authStorage';
import type { ChatMessage } from '@/types';

const isDev = import.meta.env.DEV;
function log(...args: unknown[]) {
  if (isDev) console.log('[ChatWS]', ...args);
}

interface UseChatWebSocketOptions {
  conversationId: string | null;
  enabled?: boolean;
}

export function useChatWebSocket({ conversationId, enabled = true }: UseChatWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttemptsRef = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const {
    addMessage,
    setConnecting,
    addTypingUser,
    removeTypingUser,
  } = useChatStore();

  const connect = useCallback(() => {
    if (!conversationId || !enabled) return;

    const token = getAccessToken();
    if (!token) {
      log('Pas de token, connexion WebSocket annulée');
      return;
    }

    // Déterminer l'URL WebSocket
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    let wsBaseUrl: string;

    if (apiBaseUrl.startsWith('https://')) {
      wsBaseUrl = apiBaseUrl.replace('https://', 'wss://');
    } else if (apiBaseUrl.startsWith('http://')) {
      wsBaseUrl = apiBaseUrl.replace('http://', 'ws://');
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsBaseUrl = `${protocol}//${window.location.host}`;
    }

    // Nettoyer l'URL de base (enlever /api si présent)
    wsBaseUrl = wsBaseUrl.replace(/\/api\/?$/, '');

    const wsUrl = `${wsBaseUrl}/ws/chat/${conversationId}/?token=${token}`;
    log('Connexion à', wsUrl);

    setConnecting(true);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      log('Connecté à la conversation', conversationId);
      setConnecting(false);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        log('Message reçu:', data.type);

        switch (data.type) {
          case 'message':
            addMessage(data.data as ChatMessage);
            break;

          case 'typing':
            if (data.data.is_typing) {
              addTypingUser(data.data.user_id, data.data.user_email);
            } else {
              removeTypingUser(data.data.user_id);
            }
            break;

          case 'system':
            log('Message système:', data.data.message);
            break;

          case 'error':
            console.error('[ChatWS] Erreur serveur:', data.data.message);
            break;

          case 'read_receipt':
            log('Messages lus par:', data.data.user_id);
            break;
        }
      } catch (e) {
        console.error('[ChatWS] Erreur de parsing:', e);
      }
    };

    ws.onclose = (event) => {
      log('Déconnecté (code:', event.code, ')');
      setConnecting(false);

      // Tentative de reconnexion automatique
      if (enabled && reconnectAttemptsRef.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        log(`Reconnexion dans ${delay}ms (tentative ${reconnectAttemptsRef.current + 1})`);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('[ChatWS] Erreur:', error);
      setConnecting(false);
    };
  }, [conversationId, enabled, addMessage, setConnecting, addTypingUser, removeTypingUser]);

  // Envoyer un message via WebSocket
  const sendMessage = useCallback((contenu: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        contenu,
      }));
      return true;
    }
    return false;
  }, []);

  // Envoyer l'indicateur de frappe
  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping,
      }));
    }
  }, []);

  // Marquer des messages comme lus
  const markAsRead = useCallback((messageIds: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'read',
        message_ids: messageIds,
      }));
    }
  }, []);

  // Debounced typing indicator
  const handleTyping = useCallback(() => {
    sendTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  }, [sendTyping]);

  // Connexion / déconnexion
  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    sendMessage,
    sendTyping,
    handleTyping,
    markAsRead,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
