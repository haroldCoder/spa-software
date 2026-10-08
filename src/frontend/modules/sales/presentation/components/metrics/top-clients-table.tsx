'use client';

import * as React from 'react';
import { Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { DataTable, ColumnDef } from '@/src/frontend/shared/presentation/components/data-table';
import { ClientMetricItem } from '@/src/frontend/modules/sales/domain/sales-metrics.types';
import { cn } from '@/src/lib/utils';

interface TopClientsTableProps {
  topClients: ClientMetricItem[];
  formatCurrency: (val: number) => string;
}

export function TopClientsTable({
  topClients,
  formatCurrency,
}: TopClientsTableProps) {
  const columns = React.useMemo<ColumnDef<ClientMetricItem>[]>(
    () => [
      {
        id: 'ranking',
        header: 'Ranking',
        cell: (_, idx) => (
          <span
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
              idx === 0
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                : idx === 1
                ? 'bg-stone-300/40 text-stone-700 dark:text-stone-300'
                : idx === 2
                ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                : 'text-muted-foreground'
            )}
          >
            #{idx + 1}
          </span>
        ),
      },
      {
        id: 'client',
        header: 'Cliente',
        cell: (client) => (
          <div>
            <div className="font-semibold text-foreground text-sm">
              {client.name}
            </div>
            {client.isRepeat && (
              <Badge
                variant="outline"
                className="text-[10px] bg-spa-rose/10 text-spa-rose border-spa-rose/30 mt-0.5 font-normal"
              >
                Cliente Recurrente
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'contact',
        header: 'Contacto',
        cell: (client) => (
          <div className="text-muted-foreground text-xs">
            {client.phone && <div>{client.phone}</div>}
            {client.email && <div className="text-[11px]">{client.email}</div>}
            {!client.phone && !client.email && (
              <span className="text-[11px]">Sin contacto</span>
            )}
          </div>
        ),
      },
      {
        id: 'frequency',
        header: 'Frecuencia',
        cell: (client) => (
          <Badge variant="secondary" className="text-xs font-normal">
            {client.salesCount} {client.salesCount === 1 ? 'Compra' : 'Compras'}
          </Badge>
        ),
      },
      {
        id: 'totalSpent',
        header: <span className="block text-right">Total Comprado</span>,
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (client) => (
          <span className="font-mono font-bold text-sm text-foreground">
            {formatCurrency(client.totalSpent)}
          </span>
        ),
      },
    ],
    [formatCurrency]
  );

  return (
    <Card className="border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-spa-rose" />
              Top Clientes por Facturación ({topClients.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Ranking de clientes con mayor volumen de compra acumulado y frecuencia de consumo
            </CardDescription>
          </div>
          <Badge variant="spa" className="text-xs self-start sm:self-auto">
            Clientes VIP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {topClients.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-xs">
            No hay clientes con compras registradas aún.
          </div>
        ) : (
          <DataTable
            data={topClients}
            columns={columns}
            keyExtractor={(item) => item.id}
            className="border-0 rounded-none shadow-none"
            stickyHeader={false}
          />
        )}
      </CardContent>
    </Card>
  );
}
