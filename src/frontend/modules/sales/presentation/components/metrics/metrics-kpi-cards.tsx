'use client';

import { DollarSign, Target, ShoppingBag, TrendingUp, Wallet, Receipt, HelpCircle } from 'lucide-react';
import { Card } from '@/src/components/ui/card';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/src/components/ui/hover-card';

interface MetricsKpiCardsProps {
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  totalCommissions: number;
  netRevenue: number;
  netMarginPercentage: number;
  potentialClientsCount: number;
  totalClientsCount: number;
  payingClientsCount: number;
  conversionRate: number;
  averageTicket: number;
  pipelinePotentialValue: number;
  formatCurrency: (val: number) => string;
}

export function MetricsKpiCards({
  totalRevenue,
  serviceRevenue,
  productRevenue,
  totalCommissions,
  netRevenue,
  netMarginPercentage,
  potentialClientsCount,
  totalClientsCount,
  payingClientsCount,
  conversionRate,
  averageTicket,
  pipelinePotentialValue,
  formatCurrency,
}: MetricsKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Facturación Total Bruta */}
      <Card className="p-5 border-border/80 relative overflow-hidden group hover:border-spa-rose/40 transition-all duration-300">
        <div className="absolute top-0 right-0 h-24 w-24 bg-spa-rose/5 rounded-full blur-2xl group-hover:bg-spa-rose/15 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Facturación Total
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-spa-rose/10 text-spa-rose">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-serif font-bold text-foreground">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-spa-rose font-medium">
              Servicios: {formatCurrency(serviceRevenue)}
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Prod: {formatCurrency(productRevenue)}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. KPI: Ganancia Neta Spa (Menos Comisiones de Trabajadoras) */}
      <HoverCard openDelay={150} closeDelay={150}>
        <HoverCardTrigger asChild>
          <Card className="p-5 border-border/80 relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 cursor-help">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ganancia Neta Spa
                </span>
                <HelpCircle className="h-3 w-3 text-muted-foreground/50 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-serif font-bold text-foreground">
                {formatCurrency(netRevenue)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {netMarginPercentage.toFixed(1)}% margen
                </span>
                <span>•</span>
                <span className="text-muted-foreground truncate">
                  Pasa el cursor para ver comisiones
                </span>
              </div>
            </div>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent side="top" align="center" className="w-80 p-4 space-y-3 shadow-2xl">
          {/* Cabecera del desglose */}
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Receipt className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">
                Liquidación de Ingresos
              </h4>
            </div>
            <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              {netMarginPercentage.toFixed(1)}% Retenido
            </span>
          </div>

          {/* Comparativo financiero */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Facturación Bruta:</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(totalRevenue)}
              </span>
            </div>

            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span>Comisiones Colaboradoras:</span>
              <span className="font-mono font-semibold">
                -{formatCurrency(totalCommissions)}
              </span>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between font-semibold">
              <span className="text-foreground">Ganancia Neta Spa:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                {formatCurrency(netRevenue)}
              </span>
            </div>
          </div>

          {/* Barra visual de distribución */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Spa ({netMarginPercentage.toFixed(0)}%)
              </span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                Comisiones ({Math.max(0, 100 - netMarginPercentage).toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, netMarginPercentage))}%` }}
              />
              <div
                className="bg-amber-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, 100 - netMarginPercentage))}%`,
                }}
              />
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
            Comisiones deducidas automáticamente sobre servicios realizados según el porcentaje pactado con cada trabajadora.
          </p>
        </HoverCardContent>
      </HoverCard>

      {/* 3. Clientes Potenciales & Conversión */}
      <Card className="p-5 border-border/80 relative overflow-hidden group hover:border-spa-sage/40 transition-all duration-300">
        <div className="absolute top-0 right-0 h-24 w-24 bg-spa-sage/5 rounded-full blur-2xl group-hover:bg-spa-sage/15 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Clientes Potenciales
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-spa-sage/10 text-spa-sage">
            <Target className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-foreground">
              {potentialClientsCount}
            </span>
            <span className="text-xs text-muted-foreground">
              de {totalClientsCount} clientes
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="font-semibold text-spa-sage">{conversionRate.toFixed(1)}%</span>
            <span>tasa de conversión ({payingClientsCount} compradores)</span>
          </div>
        </div>
      </Card>

      {/* 4. Ticket Promedio */}
      <Card className="p-5 border-border/80 relative overflow-hidden group hover:border-spa-gold/40 transition-all duration-300">
        <div className="absolute top-0 right-0 h-24 w-24 bg-spa-gold/5 rounded-full blur-2xl group-hover:bg-spa-gold/15 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ticket Promedio
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-spa-gold/10 text-spa-gold">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-serif font-bold text-foreground">
            {formatCurrency(averageTicket)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Promedio por cada venta cerrada
          </div>
        </div>
      </Card>

      {/* 5. Pipeline de Prospección */}
      <Card className="p-5 border-border/80 relative overflow-hidden group hover:border-spa-lavender/40 transition-all duration-300">
        <div className="absolute top-0 right-0 h-24 w-24 bg-spa-lavender/5 rounded-full blur-2xl group-hover:bg-spa-lavender/15 transition-all" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Pipeline Estimado
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-spa-lavender/10 text-spa-lavender">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-serif font-bold text-foreground">
            {formatCurrency(pipelinePotentialValue)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            En citas pendientes
          </div>
        </div>
      </Card>
    </div>
  );
}
