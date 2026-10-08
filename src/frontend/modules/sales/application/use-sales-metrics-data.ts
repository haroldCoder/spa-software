'use client';

import { useSalesMetricsQueries } from './use-sales-metrics-queries';
import { useSalesMetricsLogic } from './use-sales-metrics-logic';
import { SalesMetricsResult } from '../domain/sales-metrics.types';

// Export types so existing components don't break
export * from '../domain/sales-metrics.types';
export { useSalesMetricsQueries } from './use-sales-metrics-queries';
export { useSalesMetricsLogic, calculateSalesMetrics } from './use-sales-metrics-logic';

/**
 * Hook compositor que une las queries de datos (React Query)
 * con el hook de lógica pura y cálculos de métricas comerciales.
 */
export function useSalesMetricsData(businessId?: string): SalesMetricsResult {
  const queryData = useSalesMetricsQueries(businessId);
  const metrics = useSalesMetricsLogic(
    queryData.rawSales,
    queryData.rawClients,
    queryData.rawWorkers,
    queryData.rawAppointments
  );

  return {
    ...queryData,
    ...metrics,
  };
}
