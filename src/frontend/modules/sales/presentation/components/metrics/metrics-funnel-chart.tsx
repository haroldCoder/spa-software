'use client';

import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/src/components/ui/chart';

interface MetricsFunnelChartProps {
  totalClientsCount: number;
  potentialClientsCount: number;
  payingClientsCount: number;
  repeatClientsCount: number;
  conversionRate: number;
}

const funnelChartConfig: ChartConfig = {
  count: {
    label: 'Cantidad de Clientes',
    color: '#c81e51',
  },
};

export function MetricsFunnelChart({
  totalClientsCount,
  potentialClientsCount,
  payingClientsCount,
  repeatClientsCount,
  conversionRate,
}: MetricsFunnelChartProps) {
  const clientFunnelData = [
    { stage: 'Registrados', count: totalClientsCount, fill: '#8b5cf6' },
    { stage: 'Potenciales', count: potentialClientsCount, fill: '#3b82f6' },
    { stage: 'Compradores', count: payingClientsCount, fill: '#0d9488' },
    { stage: 'Recurrentes', count: repeatClientsCount, fill: '#c81e51' },
  ];

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Target className="h-4 w-4 text-spa-sage" />
              Embudo de Conversión de Clientes
            </CardTitle>
            <CardDescription className="text-xs">
              Desde clientes registrados y potenciales hasta clientes recurrentes
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-xs bg-spa-sage/10 text-spa-sage border-spa-sage/30"
          >
            {conversionRate.toFixed(1)}% Conversión
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={funnelChartConfig} className="h-64 w-full">
          <BarChart
            data={clientFunnelData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              dataKey="stage"
              type="category"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={85}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {clientFunnelData.map((entry, index) => (
                <Cell key={`funnel-cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="mt-4 p-3 rounded-xl bg-accent/40 border border-border/60 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-spa-rose shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tienes <strong className="text-foreground">{potentialClientsCount} clientes potenciales</strong> en el sistema que aún no han completado una compra. Puedes revisarlos en la pestaña <em>Clientes Potenciales</em> para enviarles promociones o recordarles agendar una cita.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
