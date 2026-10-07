'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getBusinessClients,
  getBusinessWorkers,
} from '@/src/frontend/modules/dashboard/infrastructure/dashboard.api';
import { fetchCatalogItems } from '@/src/frontend/modules/catalog/infrastructure/catalog.api';
import { CatalogItemType } from '@/src/frontend/modules/catalog/domain/catalog.types';

export function useSaleFormData(businessId?: string) {
  const clientsQuery = useQuery({
    queryKey: ['businessClients', businessId],
    queryFn: () => getBusinessClients(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const productsQuery = useQuery({
    queryKey: ['businessProducts', businessId],
    queryFn: () =>
      fetchCatalogItems(businessId!, {
        itemType: CatalogItemType.PRODUCT,
        isActive: true,
      }),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 2,
  });

  const servicesQuery = useQuery({
    queryKey: ['businessServices', businessId],
    queryFn: () =>
      fetchCatalogItems(businessId!, {
        itemType: CatalogItemType.SERVICE,
        isActive: true,
      }),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });

  const workersQuery = useQuery({
    queryKey: ['businessWorkers', businessId],
    queryFn: () => getBusinessWorkers(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 2,
  });

  const isLoading =
    clientsQuery.isLoading || productsQuery.isLoading || workersQuery.isLoading;

  const isError =
    clientsQuery.isError || productsQuery.isError || workersQuery.isError;

  return {
    clients: clientsQuery.data || [],
    products: productsQuery.data || [],
    services: servicesQuery.data || [],
    workers: workersQuery.data || [],
    isLoading,
    isError,
    refetchClients: clientsQuery.refetch,
    refetchProducts: productsQuery.refetch,
    refetchServices: servicesQuery.refetch,
    refetchWorkers: workersQuery.refetch,
  };
}
