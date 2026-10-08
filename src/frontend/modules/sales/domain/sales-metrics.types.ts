import { SaleItem } from './sales.types';
import { BusinessClientItem, BusinessWorkerItem } from '@/src/frontend/modules/dashboard/domain/dashboard.types';
import { AppointmentItem } from '@/src/frontend/modules/appointments/domain/appointment.types';

export interface DailySalesMetric {
  date: string;
  label: string;
  servicios: number;
  productos: number;
  total: number;
  ventasCount: number;
}

export interface ClientMetricItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  salesCount: number;
  lastPurchaseDate?: string;
  isRepeat: boolean;
}

export interface PotentialClientItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  registeredAt: string;
  hasAppointments: boolean;
  appointmentsCount: number;
  potentialValue: number;
}

export interface WorkerSalesMetric {
  workerId: string;
  workerName: string;
  total: number;
  salesCount: number;
  commissionPercentage: number;
  commissionAmount: number;
  netWorkerContribution: number;
}

export interface SalesByTypeMetric {
  name: string;
  value: number;
  fill: string;
  percentage: number;
}

export interface CalculatedSalesMetrics {
  // Totales de ventas
  totalSalesCount: number;
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  averageTicket: number;
  // Margen neto y comisiones de trabajadoras
  totalCommissions: number;
  netRevenue: number; // Monto que le queda al negocio descontando comisiones
  netMarginPercentage: number;
  // Clientes y potencial
  totalClientsCount: number;
  payingClientsCount: number;
  potentialClientsCount: number;
  conversionRate: number;
  repeatClientsCount: number;
  pipelinePotentialValue: number;
  // Gráficos y colecciones
  dailyTrend: DailySalesMetric[];
  salesByTypeData: SalesByTypeMetric[];
  topClients: ClientMetricItem[];
  workerPerformance: WorkerSalesMetric[];
  potentialClientsList: PotentialClientItem[];
}

export interface SalesMetricsQueriesResult {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  rawSales: SaleItem[];
  rawClients: BusinessClientItem[];
  rawWorkers: BusinessWorkerItem[];
  rawAppointments: AppointmentItem[];
}

export interface SalesMetricsResult extends CalculatedSalesMetrics, SalesMetricsQueriesResult {}
