'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSales } from '../infrastructure/sales.api';
import {
  getBusinessClients,
  getBusinessWorkers,
} from '@/src/frontend/modules/dashboard/infrastructure/dashboard.api';
import { getAppointments } from '@/src/frontend/modules/appointments/infrastructure/appointments.api';
import { SalesMetricsQueriesResult } from '../domain/sales-metrics.types';

/**
 * Hook dedicado exclusivamente a la capa de consultas (Queries)
 * Obtiene las ventas, clientes, trabajadoras del negocio y citas mediante React Query.
 */
export function useSalesMetricsQueries(businessId?: string): SalesMetricsQueriesResult {
  const salesQuery = useQuery({
    queryKey: ['salesMetrics', businessId],
    queryFn: () => fetchSales({ limit: 100 }),
    staleTime: 1000 * 60,
  });

  const clientsQuery = useQuery({
    queryKey: ['businessClients', businessId],
    queryFn: () => getBusinessClients(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60,
  });

  const workersQuery = useQuery({
    queryKey: ['businessWorkersForMetrics', businessId],
    queryFn: () => getBusinessWorkers(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60,
  });

  const appointmentsQuery = useQuery({
    queryKey: ['businessAppointmentsForMetrics', businessId],
    queryFn: () => getAppointments({ page: 1, limit: 100 }),
    enabled: !!businessId,
    staleTime: 1000 * 60,
  });

  const isLoading =
    salesQuery.isLoading ||
    clientsQuery.isLoading ||
    workersQuery.isLoading ||
    appointmentsQuery.isLoading;

  const isError =
    salesQuery.isError ||
    clientsQuery.isError ||
    workersQuery.isError ||
    appointmentsQuery.isError;

  const rawSales = React.useMemo(() => salesQuery.data?.items || [], [salesQuery.data]);
  const rawClients = React.useMemo(() => clientsQuery.data || [], [clientsQuery.data]);
  const rawWorkers = React.useMemo(() => workersQuery.data || [], [workersQuery.data]);
  const rawAppointments = React.useMemo(() => appointmentsQuery.data?.items || [], [appointmentsQuery.data]);

  const refetch = React.useCallback(() => {
    salesQuery.refetch();
    clientsQuery.refetch();
    workersQuery.refetch();
    appointmentsQuery.refetch();
  }, [salesQuery, clientsQuery, workersQuery, appointmentsQuery]);

  return {
    isLoading,
    isError,
    refetch,
    rawSales,
    rawClients,
    rawWorkers,
    rawAppointments,
  };
}
