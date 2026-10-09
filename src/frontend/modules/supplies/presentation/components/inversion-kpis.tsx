'use client';

import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { SuppliesSummary } from '../../domain/supplies.types';
import { DollarSign, AlertTriangle, Boxes, ShoppingCart, TrendingUp } from 'lucide-react';

interface InversionKPIsProps {
  summary?: SuppliesSummary;
  isLoading: boolean;
  onFilterLowStock?: () => void;
  isLowStockFiltered?: boolean;
}

export function InversionKPIs({
  summary,
  isLoading,
  onFilterLowStock,
  isLowStockFiltered,
}: InversionKPIsProps) {
  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val ?? 0);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: Inversión Total en Insumos */}
      <Card className="relative overflow-hidden border-border/70 hover:border-spa-rose/40 transition-colors shadow-sm">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-spa-rose to-spa-blush" />
        <CardContent className="p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Valor Total Inversión
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-serif">
                {isLoading ? '...' : formatCurrency(summary?.totalInventoryCost)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500 inline" />
              Capital valorizado en cabina
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-spa-rose/10 flex items-center justify-center text-spa-rose shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 2: Total de Insumos & Útiles */}
      <Card className="relative overflow-hidden border-border/70 hover:border-primary/40 transition-colors shadow-sm">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/70" />
        <CardContent className="p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Insumos & Útiles
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-serif">
                {isLoading ? '...' : summary?.activeSuppliesCount ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">ítems activos</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Total registrados: {summary?.totalSuppliesCount ?? 0}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Boxes className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 3: Alertas de Stock Bajo / Reposición */}
      <Card
        onClick={onFilterLowStock}
        className={`relative overflow-hidden border-border/70 cursor-pointer transition-all shadow-sm ${isLowStockFiltered
            ? 'ring-2 ring-amber-500/80 bg-amber-500/5'
            : 'hover:border-amber-500/40 hover:bg-muted/40'
          }`}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <CardContent className="p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Por Agotarse / Reponer
              </p>
              {(summary?.lowStockCount ?? 0) > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                  Crítico
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-serif">
                {isLoading ? '...' : summary?.lowStockCount ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">alertas activas</span>
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">
              {isLowStockFiltered ? '✓ Mostrando solo alertas' : 'Clic para filtrar'}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* KPI 4: Compras de Insumos del Mes */}
      <Card className="relative overflow-hidden border-border/70 hover:border-emerald-500/40 transition-colors shadow-sm">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
        <CardContent className="p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Compras del Mes
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-serif">
                {isLoading ? '...' : formatCurrency(summary?.monthlyPurchasesCost)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Consumo mes: {formatCurrency(summary?.monthlyConsumptionsCost)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
