'use client';

import { PieChart, Pie, Cell } from 'recharts';
import { Layers, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/src/components/ui/chart';
import { SalesByTypeMetric } from '@/src/frontend/modules/sales/domain/sales-metrics.types';

interface MetricsMixChartProps {
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  salesByTypeData: SalesByTypeMetric[];
  formatCurrency: (val: number) => string;
}

export function MetricsMixChart({
  totalRevenue,
  serviceRevenue,
  productRevenue,
  salesByTypeData,
  formatCurrency,
}: MetricsMixChartProps) {
  return (
    <Card className="border-border/80 shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Layers className="h-4 w-4 text-spa-gold" />
          Mix de Ventas
        </CardTitle>
        <CardDescription className="text-xs">
          Proporción entre Servicios y Productos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col items-center justify-center">
        {totalRevenue === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-6 text-muted-foreground text-xs">
            <Package className="h-8 w-8 mb-2 opacity-40 text-spa-gold" />
            <span>Sin ventas registradas aún</span>
          </div>
        ) : (
          <div className="w-full">
            <div className="h-52 w-full flex items-center justify-center">
              <ChartContainer config={{}} className="h-52 w-full">
                <PieChart>
                  <Pie
                    data={salesByTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={4}
                  >
                    {salesByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </div>

            {/* Breakdown legend */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/60">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full bg-spa-rose" />
                  <span className="font-medium text-foreground">Servicios</span>
                </div>
                <span className="text-sm font-semibold font-serif text-foreground">
                  {formatCurrency(serviceRevenue)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {salesByTypeData[0]?.percentage || 0}% del volumen
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="font-medium text-foreground">Productos</span>
                </div>
                <span className="text-sm font-semibold font-serif text-foreground">
                  {formatCurrency(productRevenue)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {salesByTypeData[1]?.percentage || 0}% del volumen
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
