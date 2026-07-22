// ============================================================
// QUERY CLIENT — Configuration TanStack Query
// ============================================================
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Durée de vie du cache (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Durée de conservation du cache inactif (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Ne pas re-fetch quand la fenêtre reprend le focus
      refetchOnWindowFocus: false,
      // Retry 1 fois en cas d'erreur
      retry: 1,
      // Refetch en arrière-plan
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});