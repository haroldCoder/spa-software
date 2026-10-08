'use client';

import { Scissors, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { WorkerSalesMetric } from '@/src/frontend/modules/sales/domain/sales-metrics.types';

interface MetricsWorkerRankingProps {
  workerPerformance: WorkerSalesMetric[];
  totalRevenue: number;
  formatCurrency: (val: number) => string;
}

export function MetricsWorkerRanking({
  workerPerformance,
  totalRevenue,
  formatCurrency,
}: MetricsWorkerRankingProps) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Scissors className="h-4 w-4 text-spa-rose" />
              Ventas por Especialista / Colaborador
            </CardTitle>
            <CardDescription className="text-xs">
              Monto facturado generado por cada miembro del equipo
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {workerPerformance.length} Miembros
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {workerPerformance.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-muted-foreground text-xs">
            <Users className="h-8 w-8 mb-2 opacity-40 text-spa-rose" />
            <span>No hay ventas asignadas a colaboradores aún.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {workerPerformance.slice(0, 5).map((w, index) => {
              const share = totalRevenue > 0 ? (w.total / totalRevenue) * 100 : 0;
              return (
                <div
                  key={w.workerId || index}
                  className="p-3 rounded-xl border border-border/60 bg-card/60 hover:bg-accent/20 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-spa-rose/10 text-spa-rose font-bold text-xs shrink-0">
                      #{index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {w.workerName}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{w.salesCount} {w.salesCount === 1 ? 'venta' : 'ventas'}</span>
                        {w.commissionPercentage > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              Comisión: {formatCurrency(w.commissionAmount)} ({w.commissionPercentage}%)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold font-serif text-foreground">
                      {formatCurrency(w.total)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {w.commissionAmount > 0
                        ? `Neto spa: ${formatCurrency(w.netWorkerContribution)}`
                        : `${share.toFixed(1)}% del total`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
