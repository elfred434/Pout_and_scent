/**
 * useOrders — Hook TanStack Query pour les commandes
 * Pout & Scent
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderEndpoints } from '@/api/endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/components/common/ToastContainer';
import { extractApiError } from '@/hooks/useToast';
import type { Commande, CheckoutPayload, PaginatedResponse } from '@/types';

// ─── Queries ───────────────────────────────────────────────

export function useOrders(filters?: { page?: number; statut?: string }) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () =>
      orderEndpoints.getMyOrders(filters).then((res) => res.data),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id || ''),
    queryFn: () => orderEndpoints.getOrder(id!).then((res) => res.data),
    enabled: Boolean(id),
  });
}

// ─── Mutations ─────────────────────────────────────────────

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutPayload) => orderEndpoints.checkout(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Commande passée avec succès ! 🎉');
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderEndpoints.cancelOrder(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Commande annulée');
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
}

export function useTransitionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      orderEndpoints.transitionOrder(id, statut).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast.success('Statut mis à jour');
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
}
