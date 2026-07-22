
import { useQuery } from '@tanstack/react-query';
import { catalogEndpoints } from '@/api/endpoints';

export function useProducts(params?: {
  page?: number;
  categorie?: string;
  search?: string;
  ordering?: string;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () =>
      catalogEndpoints.getProducts({
        page: params?.page || 1,
        page_size: 12,
        ...params,
      }).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogEndpoints.getProduct(id).then((res) => res.data),
    enabled: Boolean(id),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      catalogEndpoints.getCategories().then((res) => res.data.results),
    staleTime: 30 * 60 * 1000,
  });
}