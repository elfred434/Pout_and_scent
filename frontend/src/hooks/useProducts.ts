/**
 * useProducts — Hook TanStack Query pour le catalogue
 * Pout & Scent
 */
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { catalogEndpoints } from '@/api/endpoints';
import { queryKeys } from '@/lib/queryKeys';
import type { Produit, Categorie, PaginatedResponse } from '@/types';

// ─── Queries ───────────────────────────────────────────────

interface ProductFilters {
  page?: number;
  categorie?: string;
  categorie_id?: string;
  search?: string;
  ordering?: string;
  marque?: string;
  is_featured?: boolean;
  prix_min?: number;
  prix_max?: number;
}

export function useProducts(
  filters?: ProductFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Produit>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.products.list((filters || {}) as Record<string, unknown>),
    queryFn: () =>
      catalogEndpoints
        .getProducts({ page: 1, page_size: 12, ...filters })
        .then((res) => res.data),
    placeholderData: (prev) => prev,
    ...options,
  });
}

export function useProduct(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Produit>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.products.detail(id || ''),
    queryFn: () => catalogEndpoints.getProduct(id!).then((res) => res.data),
    enabled: Boolean(id),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    ...options,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () =>
      catalogEndpoints.getCategories().then((res) => res.data.results || []),
    staleTime: 30 * 60 * 1000, // 30 min
  });
}
