/**
 * ChatWidget — Widget de chat flottant pour le support client
 * Pout & Scent
 *
 * Affiche un bouton flottant en bas à droite qui ouvre un panneau de chat.
 * Gère la création de conversations, l'envoi de messages, et la réception en temps réel.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2, Plus, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatStore } from '@/store/chatStore';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { chatEndpoints } from '@/api/endpoints';
import type { ChatMessage, Conversation, CreateConversationPayload } from '@/types';

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const { isOpen, toggleOpen, hasUnread } = useChatStore();

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Bouton flottant - plus discret */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full shadow-md
          flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg
          ${isOpen ? 'bg-neutral-700' : 'bg-gradient-to-br from-accent-400 to-primary-500'}`}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat support'}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5 text-white" />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </>
        )}
      </button>

      {/* Panneau de chat */}
      {isOpen && <ChatPanel />}
    </>
  );
}

// ============================================================
// PANNEAU DE CHAT
// ============================================================
function ChatPanel() {
  const {
    activeConversationId,
    setActiveConversation,
    conversations,
    setConversations,
    addConversation,
    setMessages,
    setLoading,
  } = useChatStore();

  const [showNewConversation, setShowNewConversation] = useState(false);

  // Charger les conversations au montage
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await chatEndpoints.getConversations({ is_closed: 'false' } as any);
      const data = response.data;
      if ('results' in data) {
        setConversations(data.results);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (payload: CreateConversationPayload) => {
    try {
      const response = await chatEndpoints.createConversation(payload);
      addConversation(response.data);
      setActiveConversation(response.data.id);
      setShowNewConversation(false);
    } catch (error) {
      console.error('Erreur création conversation:', error);
    }
  };

  // Vue liste ou conversation active
  return (
    <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[560px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl
      flex flex-col overflow-hidden border border-gray-200 dark:border-neutral-700 animate-slide-up">

      {/* Header - couleurs plus douces */}
      <div className="bg-gradient-to-br from-accent-400 to-primary-500 px-4 py-3 flex items-center justify-between">
        {activeConversationId && !showNewConversation ? (
          <button
            onClick={() => setActiveConversation(null)}
            className="flex items-center text-white hover:text-white/90"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Conversations</span>
          </button>
        ) : (
          <div className="flex items-center text-white">
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">Support Pout & Scent</span>
          </div>
        )}

        {!activeConversationId && !showNewConversation && (
          <button
            onClick={() => setShowNewConversation(true)}
            className="text-white hover:text-gray-200 p-1"
            title="Nouvelle conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {showNewConversation ? (
          <NewConversationForm
            onSubmit={handleCreateConversation}
            onCancel={() => setShowNewConversation(false)}
          />
        ) : activeConversationId ? (
          <ConversationView conversationId={activeConversationId} />
        ) : (
          <ConversationList
            conversations={conversations}
            onSelect={(id) => {
              setActiveConversation(id);
              setShowNewConversation(false);
            }}
            onNewConversation={() => setShowNewConversation(true)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 text-center">
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          💬 Réponse sous 24h ouvrées • Lun-Sam 9h-18h
        </p>
      </div>
    </div>
  );
}

// ============================================================
// LISTE DES CONVERSATIONS
// ============================================================
function ConversationList({
  conversations,
  onSelect,
  onNewConversation,
}: {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Aucune conversation
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Vous n'avez pas encore de conversation avec le support.
        </p>
        <button
          onClick={onNewConversation}
          className="bg-gradient-to-br from-accent-400 to-primary-500 text-white px-4 py-2 rounded-xl
            font-medium hover:opacity-90 transition-opacity flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle conversation
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className="w-full px-4 py-3 border-b border-gray-100 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {conv.sujet}
                </h4>
                <StatusBadge statut={conv.statut} />
              </div>
              {conv.dernier_message && (
                <p className="text-sm text-gray-500 dark:text-neutral-400 truncate mt-1">
                  {conv.dernier_message.contenu}
                </p>
              )}
            </div>
            <div className="ml-2 text-xs text-gray-400 dark:text-neutral-500 whitespace-nowrap">
              {formatDate(conv.date_dernier_message)}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// VUE CONVERSATION ACTIVE
// ============================================================
function ConversationView({ conversationId }: { conversationId: string }) {
  const {
    messages,
    setMessages,
    addMessage,
    typingUsers,
    setHasUnread,
  } = useChatStore();

  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // WebSocket
  const { sendMessage: sendWS, handleTyping, isConnected } = useChatWebSocket({
    conversationId,
    enabled: true,
  });

  // Charger l'historique
  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Marquer comme lu quand on ouvre
  useEffect(() => {
    chatEndpoints.markAsRead(conversationId).catch(() => {});
    setHasUnread(false);
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const response = await chatEndpoints.getMessages(conversationId);
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const handleSend = async () => {
    const contenu = inputValue.trim();
    if (!contenu || isSending) return;

    setIsSending(true);
    setInputValue('');

    // Essayer WebSocket d'abord
    const sentViaWS = sendWS(contenu);

    if (!sentViaWS) {
      // Fallback REST
      try {
        const response = await chatEndpoints.sendMessage(conversationId, { contenu });
        addMessage(response.data);
      } catch (error) {
        console.error('Erreur envoi message:', error);
        setInputValue(contenu); // Restaurer le message
      }
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    handleTyping();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Indicateur de connexion */}
      <div className={`px-4 py-1 text-xs text-center ${isConnected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
        {isConnected ? '● Connecté en temps réel' : '○ Connexion en cours...'}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-neutral-800">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-neutral-500 py-8">
            <p>Aucun message pour le moment.</p>
            <p className="text-sm mt-1">Envoyez votre premier message ci-dessous.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.auteur_id === user?.id || msg.auteur === user?.id}
          />
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{typingUsers[0].email} est en train d'écrire...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500 rounded-full focus:outline-none
              focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="p-2 bg-gradient-to-br from-accent-400 to-primary-500 text-white rounded-full
              hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BULLE DE MESSAGE
// ============================================================
function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  if (message.type_message === 'SYSTEM') {
    return (
      <div className="text-center">
        <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-neutral-400 rounded-full text-xs">
          {message.contenu}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-gradient-to-br from-accent-400 to-primary-500 text-white rounded-br-sm'
            : 'bg-white dark:bg-neutral-700 text-gray-800 dark:text-white shadow-sm border border-gray-200 dark:border-neutral-600 rounded-bl-sm'
        }`}
      >
        {!isOwn && message.auteur_nom && (
          <p className="text-xs font-medium text-primary-600 mb-1">
            {message.auteur_nom}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.contenu}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400 dark:text-neutral-500'}`}>
          {formatTime(message.created_at)}
          {isOwn && message.is_read && ' ✓✓'}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// FORMULAIRE NOUVELLE CONVERSATION
// ============================================================
function NewConversationForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: CreateConversationPayload) => void;
  onCancel: () => void;
}) {
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sujet.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit({
      sujet: sujet.trim(),
      message_initial: message.trim(),
    });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Nouvelle conversation
      </h3>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">
            Sujet
          </label>
          <input
            type="text"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder="Ex: Question sur ma commande"
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500 rounded-xl focus:outline-none
              focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            maxLength={255}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-neutral-400 mb-1">
            Votre message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez votre question ou problème..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500 rounded-xl focus:outline-none
              focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
            rows={5}
            maxLength={2000}
            required
          />
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
            {message.length}/2000 caractères
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-white rounded-xl
            hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!sujet.trim() || !message.trim() || isSubmitting}
          className="flex-1 px-4 py-2 bg-gradient-to-br from-accent-400 to-primary-500 text-white rounded-xl
            hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
            text-sm font-medium shadow-sm"
        >
          {isSubmitting ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// BADGE DE STATUT
// ============================================================
function StatusBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    OUVERTE: 'bg-yellow-100 text-yellow-800',
    EN_COURS: 'bg-blue-100 text-blue-800',
    RESOLUE: 'bg-green-100 text-green-800',
    FERMEE: 'bg-gray-100 text-gray-800',
  };

  const labels: Record<string, string> = {
    OUVERTE: 'Ouverte',
    EN_COURS: 'En cours',
    RESOLUE: 'Résolue',
    FERMEE: 'Fermée',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[statut] || colors.OUVERTE}`}>
      {labels[statut] || statut}
    </span>
  );
}

// ============================================================
// HELPERS
// ============================================================
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return formatTime(dateStr);
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
