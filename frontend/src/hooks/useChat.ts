/**
 * useChat — Hook TanStack Query pour le chat support
 * Pout & Scent
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatEndpoints } from '@/api/endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/components/common/ToastContainer';
import { extractApiError } from '@/hooks/useToast';
import type { Conversation, ChatMessage, CreateConversationPayload, SendMessagePayload } from '@/types';

// ─── Queries ───────────────────────────────────────────────

export function useConversations(filters?: { statut?: string; page?: number }) {
  return useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: () =>
      chatEndpoints.getConversations(filters).then((res) => res.data),
    refetchInterval: 30000, // Polling toutes les 30s en backup du WebSocket
  });
}

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.conversation(id || ''),
    queryFn: () => chatEndpoints.getConversation(id!).then((res) => res.data),
    enabled: Boolean(id),
  });
}

export function useChatMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.messages(conversationId || ''),
    queryFn: () =>
      chatEndpoints.getMessages(conversationId!).then((res) => res.data),
    enabled: Boolean(conversationId),
  });
}

// ─── Mutations ─────────────────────────────────────────────

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationPayload) =>
      chatEndpoints.createConversation(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
      toast.success('Conversation créée');
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: SendMessagePayload }) =>
      chatEndpoints.sendMessage(conversationId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
}

export function useCloseConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      chatEndpoints.closeConversation(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
      toast.success('Conversation fermée');
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
}

export function useMarkChatAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatEndpoints.markAsRead(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(conversationId),
      });
    },
  });
}
