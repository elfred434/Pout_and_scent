/**
 * useAddresses — Hook TanStack Query pour les adresses
 * Pout & Scent
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userEndpoints } from '@/api/endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/components/common/ToastContainer';
import { extractApiError } from '@/hooks/useToast';
import type { Adresse } from '@/types';

// ─── Queries ───────────────────────────────────────────────

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses.list(),
    queryFn: () =>
      userEndpoints.getAddresses().then((res) => res.data.results || res.data),
  });
}

// ─── Mutations ─────────────────────────────────────────────

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Adresse>) =>
      userEndpoints.createAddress(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success('Adresse ajoutée');
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Adresse> }) =>
      userEndpoints.updateAddress(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success('Adresse mise à jour');
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userEndpoints.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast.success('Adresse supprimée');
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });
}
