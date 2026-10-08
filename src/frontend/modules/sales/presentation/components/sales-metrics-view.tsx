'use client';

import * as React from 'react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useSalesMetricsData } from '../../application/use-sales-metrics-data';

// Subcomponentes modulares de métricas
import { MetricsHeader, type MetricsTab } from './metrics/metrics-header';
import { MetricsKpiCards } from './metrics/metrics-kpi-cards';
import { MetricsRevenueChart } from './metrics/metrics-revenue-chart';
import { MetricsMixChart } from './metrics/metrics-mix-chart';
import { MetricsFunnelChart } from './metrics/metrics-funnel-chart';
import { MetricsWorkerRanking } from './metrics/metrics-worker-ranking';
import { PotentialClientsTable } from './metrics/potential-clients-table';
import { TopClientsTable } from './metrics/top-clients-table';

interface SalesMetricsViewProps {
  businessId?: string;
  onBackToTable: () => void;
  currency?: string;
}

export function SalesMetricsView({
  businessId,
  onBackToTable,
  currency = 'COP',
}: SalesMetricsViewProps) {
  const {
    isLoading,
    isError,
    refetch,
    totalSalesCount,
    totalRevenue,
    serviceRevenue,
    productRevenue,
    totalCommissions,
    netRevenue,
    netMarginPercentage,
    averageTicket,
    totalClientsCount,
    payingClientsCount,
    potentialClientsCount,
    conversionRate,
    repeatClientsCount,
    pipelinePotentialValue,
    dailyTrend,
    salesByTypeData,
    topClients,
    workerPerformance,
    potentialClientsList,
  } = useSalesMetricsData(businessId);

  const [activeTab, setActiveTab] = React.useState<MetricsTab>('overview');

  const formatCurrency = React.useCallback(
    (val: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(val);
    },
    [currency]
  );

  // 1. Estado de carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onBackToTable} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Ventas</span>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-card border border-border/60 p-6" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          <div className="h-80 rounded-2xl bg-card border border-border/60" />
          <div className="h-80 rounded-2xl bg-card border border-border/60" />
        </div>
      </div>
    );
  }

  // 2. Estado de error
  if (isError) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-serif font-bold text-foreground">
          Error al cargar las métricas comerciales
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Ocurrió un problema consultando las ventas y clientes potenciales. Por favor reintenta.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={onBackToTable}>
            Volver a la tabla
          </Button>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Reintentar</span>
          </Button>
        </div>
      </div>
    );
  }

  // 3. Vista principal orquestada
  return (
    <div className="space-y-6" id="sales-metrics-section">
      {/* Cabecera y barra de pestañas */}
      <MetricsHeader
        totalSalesCount={totalSalesCount}
        potentialClientsCount={potentialClientsCount}
        payingClientsCount={payingClientsCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={() => refetch()}
        onBackToTable={onBackToTable}
      />

      {/* Tarjetas de KPI principales */}
      <MetricsKpiCards
        totalRevenue={totalRevenue}
        serviceRevenue={serviceRevenue}
        productRevenue={productRevenue}
        totalCommissions={totalCommissions}
        netRevenue={netRevenue}
        netMarginPercentage={netMarginPercentage}
        potentialClientsCount={potentialClientsCount}
        totalClientsCount={totalClientsCount}
        payingClientsCount={payingClientsCount}
        conversionRate={conversionRate}
        averageTicket={averageTicket}
        pipelinePotentialValue={pipelinePotentialValue}
        formatCurrency={formatCurrency}
      />

      {/* Pestaña: Resumen y Gráficas */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MetricsRevenueChart dailyTrend={dailyTrend} />
            <MetricsMixChart
              totalRevenue={totalRevenue}
              serviceRevenue={serviceRevenue}
              productRevenue={productRevenue}
              salesByTypeData={salesByTypeData}
              formatCurrency={formatCurrency}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricsFunnelChart
              totalClientsCount={totalClientsCount}
              potentialClientsCount={potentialClientsCount}
              payingClientsCount={payingClientsCount}
              repeatClientsCount={repeatClientsCount}
              conversionRate={conversionRate}
            />
            <MetricsWorkerRanking
              workerPerformance={workerPerformance}
              totalRevenue={totalRevenue}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      )}

      {/* Pestaña: Directorio de Clientes Potenciales */}
      {activeTab === 'potential-clients' && (
        <PotentialClientsTable
          potentialClientsList={potentialClientsList}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Pestaña: Top Clientes Compradores */}
      {activeTab === 'top-clients' && (
        <TopClientsTable
          topClients={topClients}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
