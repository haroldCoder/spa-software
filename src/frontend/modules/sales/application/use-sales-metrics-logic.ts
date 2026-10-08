'use client';

import * as React from 'react';
import { SaleItem } from '../domain/sales.types';
import { BusinessClientItem, BusinessWorkerItem } from '@/src/frontend/modules/dashboard/domain/dashboard.types';
import { AppointmentItem } from '@/src/frontend/modules/appointments/domain/appointment.types';
import {
  CalculatedSalesMetrics,
  DailySalesMetric,
  ClientMetricItem,
  PotentialClientItem,
  WorkerSalesMetric,
} from '../domain/sales-metrics.types';

/**
 * Función pura que calcula todas las métricas comerciales, de prospección
 * y el margen neto descontando las comisiones pactadas con las trabajadoras.
 */
export function calculateSalesMetrics(
  rawSales: SaleItem[],
  rawClients: BusinessClientItem[],
  rawWorkers: BusinessWorkerItem[],
  rawAppointments: AppointmentItem[]
): CalculatedSalesMetrics {
  // 1. Mapeo de comisiones pactadas por trabajadora
  const workerRateMap = new Map<string, { name: string; commissionPercentage: number }>();
  for (const w of rawWorkers) {
    const fullName = w.fullName || `${w.firstName} ${w.lastName}`.trim();
    workerRateMap.set(w.id, {
      name: fullName,
      commissionPercentage: Number(w.commissionPercentage) || 0,
    });
  }

  // 2. Totales financieros y comisiones
  const totalSalesCount = rawSales.length;
  let totalRevenue = 0;
  let serviceRevenue = 0;
  let productRevenue = 0;
  let totalCommissions = 0;

  // Tracking por cliente
  const clientSalesMap = new Map<
    string,
    { totalSpent: number; count: number; name: string; email: string; phone: string; lastDate: string }
  >();

  // Tracking por trabajador: total vendido y comisiones acumuladas
  const workerStatsMap = new Map<
    string,
    { name: string; total: number; count: number; commissionPercentage: number; commissionAmount: number }
  >();

  // Tracking por fecha
  const dateMap = new Map<string, { servicios: number; productos: number; total: number; count: number }>();

  for (const sale of rawSales) {
    const saleTotal = Number(sale.totalAmount) || 0;
    const sAmt = Number(sale.serviceAmount) || 0;
    const pAmt = Number(sale.productAmount) || 0;

    totalRevenue += saleTotal;
    serviceRevenue += sAmt;
    productRevenue += pAmt;

    // Cálculo de comisión para esta venta
    const wId = sale.workerId || 'unassigned';
    const workerInfo = workerRateMap.get(wId);
    const commPct = workerInfo ? workerInfo.commissionPercentage : 0;

    // En spas las comisiones se aplican principalmente sobre servicios prestados (o sobre el total si no se discriminan)
    const commissionBase = sAmt > 0 ? sAmt : (pAmt === 0 ? saleTotal : 0);
    const saleCommission = (commissionBase * commPct) / 100;
    totalCommissions += saleCommission;

    // Agrupación por cliente
    const cId = sale.clientId || 'anon';
    const cName =
      sale.clientName ||
      `${sale.client?.firstName || ''} ${sale.client?.lastName || ''}`.trim() ||
      'Cliente';
    const cEmail = sale.client?.email || '';
    const cPhone = sale.client?.phone || '';
    const existingClient = clientSalesMap.get(cId) || {
      totalSpent: 0,
      count: 0,
      name: cName,
      email: cEmail,
      phone: cPhone,
      lastDate: sale.createdAt,
    };

    existingClient.totalSpent += saleTotal;
    existingClient.count += 1;
    if (new Date(sale.createdAt) > new Date(existingClient.lastDate)) {
      existingClient.lastDate = sale.createdAt;
    }
    clientSalesMap.set(cId, existingClient);

    // Agrupación por trabajador
    const wName =
      sale.workerName ||
      workerInfo?.name ||
      `${sale.worker?.firstName || ''} ${sale.worker?.lastName || ''}`.trim() ||
      'General / Spa';

    const existingWorker = workerStatsMap.get(wId) || {
      name: wName,
      total: 0,
      count: 0,
      commissionPercentage: commPct,
      commissionAmount: 0,
    };

    existingWorker.total += saleTotal;
    existingWorker.count += 1;
    existingWorker.commissionAmount += saleCommission;
    workerStatsMap.set(wId, existingWorker);

    // Agrupación por fecha (YYYY-MM-DD)
    const dateKey = sale.createdAt ? sale.createdAt.substring(0, 10) : 'Sin fecha';
    const existingDate = dateMap.get(dateKey) || { servicios: 0, productos: 0, total: 0, count: 0 };
    existingDate.servicios += sAmt;
    existingDate.productos += pAmt;
    existingDate.total += saleTotal;
    existingDate.count += 1;
    dateMap.set(dateKey, existingDate);
  }

  // Margen neto para el negocio (Ingresos Totales - Comisiones pagadas)
  const netRevenue = Math.max(0, totalRevenue - totalCommissions);
  const netMarginPercentage = totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0;
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  // 3. Tendencia diaria (ordenada cronológicamente)
  const sortedDates = Array.from(dateMap.keys()).sort();
  const dailyTrend: DailySalesMetric[] = sortedDates.map((dateStr) => {
    const data = dateMap.get(dateStr)!;
    let label = dateStr;
    try {
      const d = new Date(dateStr);
      label = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    } catch {
      label = dateStr;
    }
    return {
      date: dateStr,
      label,
      servicios: Math.round(data.servicios),
      productos: Math.round(data.productos),
      total: Math.round(data.total),
      ventasCount: data.count,
    };
  });

  // 4. Ventas por tipo (Servicio vs Producto)
  const totalSplit = serviceRevenue + productRevenue;
  const salesByTypeData = [
    {
      name: 'Servicios',
      value: Math.round(serviceRevenue),
      fill: '#c81e51', // Spa Rose
      percentage: totalSplit > 0 ? Math.round((serviceRevenue / totalSplit) * 100) : 0,
    },
    {
      name: 'Productos',
      value: Math.round(productRevenue),
      fill: '#d97706', // Spa Gold
      percentage: totalSplit > 0 ? Math.round((productRevenue / totalSplit) * 100) : 0,
    },
  ];

  // 5. Clientes compradores y métricas de recurrencia
  const topClients: ClientMetricItem[] = Array.from(clientSalesMap.entries())
    .filter(([id]) => id !== 'anon')
    .map(([id, item]) => ({
      id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      totalSpent: Math.round(item.totalSpent),
      salesCount: item.count,
      lastPurchaseDate: item.lastDate,
      isRepeat: item.count > 1,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  const repeatClientsCount = topClients.filter((c) => c.isRepeat).length;
  const payingClientsSet = new Set(topClients.map((c) => c.id));
  const payingClientsCount = payingClientsSet.size;

  // 6. Análisis de Clientes Potenciales
  const appointmentsByClient = new Map<string, { count: number; potentialValue: number }>();
  for (const apt of rawAppointments) {
    if (apt.clientId) {
      const current = appointmentsByClient.get(apt.clientId) || { count: 0, potentialValue: 0 };
      current.count += 1;
      if (apt.status === 'PENDING' || apt.status === 'CONFIRMED') {
        current.potentialValue += Number(apt.price) || 0;
      }
      appointmentsByClient.set(apt.clientId, current);
    }
  }

  const potentialClientsList: PotentialClientItem[] = [];
  let pipelinePotentialValue = 0;

  for (const client of rawClients) {
    const isPaying = payingClientsSet.has(client.id);
    const aptInfo = appointmentsByClient.get(client.id) || { count: 0, potentialValue: 0 };

    if (!isPaying) {
      potentialClientsList.push({
        id: client.id,
        fullName: client.fullName || `${client.firstName} ${client.lastName}`.trim(),
        email: client.email || '',
        phone: client.phone || '',
        registeredAt: client.createdAt,
        hasAppointments: aptInfo.count > 0,
        appointmentsCount: aptInfo.count,
        potentialValue: aptInfo.potentialValue,
      });
    }

    pipelinePotentialValue += aptInfo.potentialValue;
  }

  const totalClientsCount = rawClients.length > 0 ? rawClients.length : payingClientsCount;
  const potentialClientsCount = Math.max(0, totalClientsCount - payingClientsCount);
  const conversionRate = totalClientsCount > 0 ? (payingClientsCount / totalClientsCount) * 100 : 0;

  // 7. Rendimiento y comisiones por colaboradora
  const workerPerformance: WorkerSalesMetric[] = Array.from(workerStatsMap.entries())
    .map(([workerId, data]) => {
      const commRounded = Math.round(data.commissionAmount);
      const totalRounded = Math.round(data.total);
      return {
        workerId,
        workerName: data.name,
        total: totalRounded,
        salesCount: data.count,
        commissionPercentage: data.commissionPercentage,
        commissionAmount: commRounded,
        netWorkerContribution: Math.max(0, totalRounded - commRounded),
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    totalSalesCount,
    totalRevenue: Math.round(totalRevenue),
    serviceRevenue: Math.round(serviceRevenue),
    productRevenue: Math.round(productRevenue),
    averageTicket: Math.round(averageTicket),
    totalCommissions: Math.round(totalCommissions),
    netRevenue: Math.round(netRevenue),
    netMarginPercentage,
    totalClientsCount,
    payingClientsCount,
    potentialClientsCount,
    conversionRate,
    repeatClientsCount,
    pipelinePotentialValue: Math.round(pipelinePotentialValue),
    dailyTrend,
    salesByTypeData,
    topClients,
    workerPerformance,
    potentialClientsList,
  };
}

/**
 * Hook de lógica pura para calcular métricas memoizadas
 */
export function useSalesMetricsLogic(
  rawSales: SaleItem[],
  rawClients: BusinessClientItem[],
  rawWorkers: BusinessWorkerItem[],
  rawAppointments: AppointmentItem[]
): CalculatedSalesMetrics {
  return React.useMemo(() => {
    return calculateSalesMetrics(rawSales, rawClients, rawWorkers, rawAppointments);
  }, [rawSales, rawClients, rawWorkers, rawAppointments]);
}
