/**
 * Store Zustand pour le chat en direct — Pout & Scent
 * Gère l'état du widget de chat et les messages en temps réel.
 */
import { create } from 'zustand';
import type { ChatMessage, Conversation } from '@/types';

interface ChatState {
  // État du widget
  isOpen: boolean;
  activeConversationId: string | null;

  // Conversations
  conversations: Conversation[];

  // Messages de la conversation active
  messages: ChatMessage[];

  // Indicateurs
  isLoading: boolean;
  isConnecting: boolean;
  hasUnread: boolean;

  // Typing indicator
  typingUsers: { userId: string; email: string }[];

  // Actions
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setActiveConversation: (id: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Partial<Conversation> & { id: string }) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setHasUnread: (hasUnread: boolean) => void;
  addTypingUser: (userId: string, email: string) => void;
  removeTypingUser: (userId: string) => void;
  clearTypingUsers: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  // État initial
  isOpen: false,
  activeConversationId: null,
  conversations: [],
  messages: [],
  isLoading: false,
  isConnecting: false,
  hasUnread: false,
  typingUsers: [],

  // Actions
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setActiveConversation: (id) => set({ activeConversationId: id }),

  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  updateConversation: (updated) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === updated.id ? { ...c, ...updated } : c
      ),
    })),

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setHasUnread: (hasUnread) => set({ hasUnread }),

  addTypingUser: (userId, email) =>
    set((state) => ({
      typingUsers: [
        ...state.typingUsers.filter((u) => u.userId !== userId),
        { userId, email },
      ],
    })),
  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((u) => u.userId !== userId),
    })),
  clearTypingUsers: () => set({ typingUsers: [] }),

  reset: () =>
    set({
      isOpen: false,
      activeConversationId: null,
      conversations: [],
      messages: [],
      isLoading: false,
      isConnecting: false,
      hasUnread: false,
      typingUsers: [],
    }),
}));
