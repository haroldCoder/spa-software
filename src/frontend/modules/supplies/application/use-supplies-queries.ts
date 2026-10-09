import { useQuery } from '@tanstack/react-query';
import { fetchSupplies, fetchSuppliesSummary } from '../infrastructure/supplies.api';
import { SupplyFilter } from '../domain/supplies.types';

export function useSuppliesQueries(businessId?: string, filters?: SupplyFilter) {
  const suppliesQuery = useQuery({
    queryKey: ['supplies', businessId, filters],
    queryFn: () => fetchSupplies(businessId!, filters),
    enabled: !!businessId,
  });

  const summaryQuery = useQuery({
    queryKey: ['suppliesSummary', businessId],
    queryFn: () => fetchSuppliesSummary(businessId!),
    enabled: !!businessId,
  });

  return {
    suppliesQuery,
    summaryQuery,
  };
}
