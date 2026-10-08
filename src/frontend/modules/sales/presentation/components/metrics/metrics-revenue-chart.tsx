'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/src/components/ui/chart';
import { DailySalesMetric } from '@/src/frontend/modules/sales/domain/sales-metrics.types';

interface MetricsRevenueChartProps {
  dailyTrend: DailySalesMetric[];
}

const revenueChartConfig: ChartConfig = {
  total: {
    label: 'Ingreso Total',
    color: '#c81e51',
  },
  servicios: {
    label: 'Servicios',
    color: '#fb7185',
  },
  productos: {
    label: 'Productos',
    color: '#d97706',
  },
};

export function MetricsRevenueChart({ dailyTrend }: MetricsRevenueChartProps) {
  return (
    <Card className="lg:col-span-2 border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-spa-rose" />
              Evolución de Ingresos en el Tiempo
            </CardTitle>
            <CardDescription className="text-xs">
              Desglose cronológico de ventas de servicios y productos
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-normal">
            {dailyTrend.length} Días con actividad
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {dailyTrend.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-muted-foreground text-xs">
            <ShoppingBag className="h-8 w-8 mb-2 opacity-40 text-spa-rose" />
            <span>Aún no hay suficientes registros diarios para graficar la curva de ventas.</span>
          </div>
        ) : (
          <ChartContainer config={revenueChartConfig} className="h-72 w-full">
            <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c81e51" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#c81e51" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillServicios" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#c81e51"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#fillTotal)"
                name="total"
              />
              <Area
                type="monotone"
                dataKey="servicios"
                stroke="#fb7185"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#fillServicios)"
                name="servicios"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
