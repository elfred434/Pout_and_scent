/**
 * ADMIN CONVERSATIONS — Gestion du chat support
 * Pout & Scent
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/common/Button';
import {
  MessageSquare,
  Send,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { apiClient } from '@/api/client';

export function AdminConversationsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const { data: convData, isLoading } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: () => apiClient.get('/v1/chat/conversations/', { params: { page_size: 50 } }).then(r => r.data),
  });

  const { data: messagesData } = useQuery({
    queryKey: ['admin-messages', selectedId],
    queryFn: () => apiClient.get(`/v1/chat/conversations/${selectedId}/messages/`).then(r => r.data),
    enabled: !!selectedId,
  });

  const { data: selectedConv } = useQuery({
    queryKey: ['admin-conv-detail', selectedId],
    queryFn: () => apiClient.get(`/v1/chat/conversations/${selectedId}/`).then(r => r.data),
    enabled: !!selectedId,
  });

  const conversations = convData?.results || [];
  const messages = messagesData || [];

  const sendMessage = useMutation({
    mutationFn: () => apiClient.post(`/v1/chat/conversations/${selectedId}/send/`, {
      contenu: newMessage,
    }),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-messages', selectedId] });
    },
  });

  const assignAgent = useMutation({
    mutationFn: (id: string) => apiClient.post(`/v1/chat/conversations/${id}/assign/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-conversations'] }),
  });

  const resolveConv = useMutation({
    mutationFn: (id: string) => apiClient.post(`/v1/chat/conversations/${id}/resolve/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-conversations'] }),
  });

  const closeConv = useMutation({
    mutationFn: (id: string) => apiClient.post(`/v1/chat/conversations/${id}/close/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-conversations'] }),
  });

  const getStatusBadge = (statut: string, is_closed: boolean) => {
    if (is_closed) return <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">Fermée</span>;
    switch (statut) {
      case 'OUVERTE': return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Ouverte</span>;
      case 'EN_COURS': return <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">En cours</span>;
      case 'RESOLUE': return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Résolue</span>;
      case 'FERMEE': return <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">Fermée</span>;
      default: return null;
    }
  };

  // Vue détail
  if (selectedId && selectedConv) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <button onClick={() => setSelectedId(null)} className="icon-btn" aria-label="Retour aux conversations">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-neutral-900">{selectedConv.sujet}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {getStatusBadge(selectedConv.statut, selectedConv.is_closed)}
              <span className="text-sm text-neutral-500">{selectedConv.client_email}</span>
              <span className="text-sm text-neutral-500">• Priorité: {selectedConv.priorite}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!selectedConv.is_closed && selectedConv.statut !== 'EN_COURS' && (
              <Button variant="outline" onClick={() => assignAgent.mutate(selectedId)} disabled={assignAgent.isPending}>
                <UserCheck className="h-4 w-4 mr-1" /> Assigner
              </Button>
            )}
            {!selectedConv.is_closed && selectedConv.statut !== 'RESOLUE' && (
              <Button variant="outline" onClick={() => resolveConv.mutate(selectedId)} disabled={resolveConv.isPending}>
                <CheckCircle className="h-4 w-4 mr-1" /> Résoudre
              </Button>
            )}
            {!selectedConv.is_closed && (
              <Button variant="outline" onClick={() => closeConv.mutate(selectedId)} disabled={closeConv.isPending}>
                <XCircle className="h-4 w-4 mr-1" /> Fermer
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">Aucun message</p>
          ) : messages.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.auteur === selectedConv.client ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[70%] rounded-xl px-4 py-2 ${
                msg.auteur === selectedConv.client
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'bg-primary-600 text-white'
              }`}>
                <p className="text-xs opacity-70 mb-1">{msg.auteur_email || 'Agent'}</p>
                <p className="text-sm">{msg.contenu}</p>
                <p className="text-xs opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        {!selectedConv.is_closed && (
          <form onSubmit={(e) => { e.preventDefault(); if (newMessage.trim()) sendMessage.mutate(); }} className="flex items-end gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Écrire un message</span>
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Écrire un message..." className="input" />
            </label>
            <Button type="submit" disabled={!newMessage.trim() || sendMessage.isPending} className="!h-12 !w-12 !min-h-12 !px-0" aria-label="Envoyer le message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    );
  }

  // Vue liste
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Conversations</h1>
        <p className="text-neutral-600">{conversations.length} conversations</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {isLoading ? (
          <div className="p-6 text-center text-neutral-500">Chargement...</div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucune conversation</h3>
            <p className="text-neutral-600">Les conversations clients apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {conversations.map((conv: any) => (
              <button key={conv.id} onClick={() => setSelectedId(conv.id)}
                className="w-full p-4 hover:bg-neutral-50 transition-colors text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {conv.client_nom?.[0] || conv.client_email?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{conv.sujet}</h3>
                      <p className="text-sm text-neutral-500">{conv.client_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(conv.statut, conv.is_closed)}
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(conv.date_dernier_message || conv.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
