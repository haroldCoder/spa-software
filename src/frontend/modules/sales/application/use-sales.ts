'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSales } from '../infrastructure/sales.api';
import { SaleFilter } from '../domain/sales.types';

export function useSales(filters: SaleFilter = {}) {
  const { page = 1, limit = 10, itemType = 'ALL', clientId, workerId } = filters;

  const query = useQuery({
    queryKey: ['sales', { page, limit, itemType, clientId, workerId }],
    queryFn: () => fetchSales(filters),
    staleTime: 1000 * 30, // 30 seconds
    placeholderData: (previousData) => previousData,
  });

  return {
    items: query.data?.items || [],
    total: query.data?.total || 0,
    page: query.data?.page || page,
    limit: query.data?.limit || limit,
    totalPages: query.data?.totalPages || 0,
    hasNextPage: query.data?.hasNextPage || false,
    hasPrevPage: query.data?.hasPrevPage || false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
