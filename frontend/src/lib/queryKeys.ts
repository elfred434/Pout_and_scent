/**
 * Query Key Factory — Pout & Scent
 * Centralise toutes les clés de cache TanStack Query pour éviter les collisions
 * et faciliter l'invalidation.
 *
 * Usage :
 *   queryKeys.products.list({ page: 1 })
 *   queryKeys.orders.detail(id)
 *   queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
 */

export const queryKeys = {
  // ─── Auth / User ───────────────────────────────────────────
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // ─── Catalogue ─────────────────────────────────────────────
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },

  // ─── Commandes ─────────────────────────────────────────────
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // ─── Adresses ──────────────────────────────────────────────
  addresses: {
    all: ['addresses'] as const,
    list: () => [...queryKeys.addresses.all, 'list'] as const,
  },

  // ─── Promotions ────────────────────────────────────────────
  promotions: {
    all: ['promotions'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.promotions.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.promotions.all, 'detail', id] as const,
  },

  // ─── Avis ──────────────────────────────────────────────────
  reviews: {
    all: ['reviews'] as const,
    byProduct: (productId: string) =>
      [...queryKeys.reviews.all, 'product', productId] as const,
    mine: () => [...queryKeys.reviews.all, 'mine'] as const,
  },

  // ─── Chat ──────────────────────────────────────────────────
  chat: {
    all: ['chat'] as const,
    conversations: () => [...queryKeys.chat.all, 'conversations'] as const,
    conversation: (id: string) =>
      [...queryKeys.chat.conversations(), id] as const,
    messages: (conversationId: string) =>
      [...queryKeys.chat.all, 'messages', conversationId] as const,
  },
} as const;
