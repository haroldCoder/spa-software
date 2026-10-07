'use client';

import * as React from 'react';
import { SaleItem } from '../../domain/sales.types';
import { ColumnDef } from '@/src/frontend/shared/presentation/components/data-table';
import { Badge } from '@/src/components/ui/badge';
import {
  Calendar,
  User,
  Package,
  Scissors,
  Layers,
} from 'lucide-react';

interface UseSalesColumnsOptions {
  currency?: string;
}

export function useSalesColumns({
  currency = 'COP',
}: UseSalesColumnsOptions = {}): ColumnDef<SaleItem>[] {
  const formatDateTime = React.useCallback((dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const dateFormatted = new Intl.DateTimeFormat('es-CO', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);

      const timeFormatted = new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);

      return { dateFormatted, timeFormatted };
    } catch {
      return { dateFormatted: dateStr, timeFormatted: '' };
    }
  }, []);

  const formatPrice = React.useCallback(
    (amount: number) => {
      try {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: currency || 'COP',
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        return `$${amount.toLocaleString()}`;
      }
    },
    [currency]
  );

  return React.useMemo<ColumnDef<SaleItem>[]>(
    () => [
      {
        id: 'client',
        header: 'Cliente',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => {
          const clientName = item.clientName || 'Cliente General';
          const initial = clientName[0]?.toUpperCase() || 'C';

          return (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-spa-rose/10 text-spa-rose flex items-center justify-center font-bold text-xs shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground text-xs sm:text-sm truncate">
                  {clientName}
                </div>
                {item.client?.phone && (
                  <div className="text-[11px] text-muted-foreground">
                    {item.client.phone}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'detail',
        header: 'Ítem Vendido',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => {
          const isProduct = item.itemType === 'PRODUCT';
          const isService = item.itemType === 'SERVICE';

          return (
            <div>
              <div className="flex items-center gap-2">
                {isProduct ? (
                  <Package className="h-3.5 w-3.5 text-spa-rose shrink-0" />
                ) : isService ? (
                  <Scissors className="h-3.5 w-3.5 text-spa-sage shrink-0" />
                ) : (
                  <Layers className="h-3.5 w-3.5 text-spa-gold shrink-0" />
                )}
                <span className="font-medium text-xs sm:text-sm text-foreground">
                  {item.itemsSummary || 'Venta registrada'}
                </span>
              </div>
              {item.items && item.items.length > 0 && (
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {item.items.length === 1
                    ? `${item.items[0].quantity} unidad(es) @ ${formatPrice(item.items[0].unitPrice)}`
                    : `${item.items.length} ítems en esta venta`}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: 'type',
        header: 'Tipo',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => {
          if (item.itemType === 'PRODUCT') {
            return (
              <Badge
                variant="outline"
                className="text-[11px] font-medium border-spa-rose/30 bg-spa-rose/10 text-spa-rose gap-1"
              >
                <Package className="h-3 w-3" />
                <span>Producto Físico</span>
              </Badge>
            );
          }
          if (item.itemType === 'SERVICE') {
            return (
              <Badge
                variant="outline"
                className="text-[11px] font-medium border-spa-sage/30 bg-spa-sage/10 text-spa-sage gap-1"
              >
                <Scissors className="h-3 w-3" />
                <span>Servicio</span>
              </Badge>
            );
          }
          return (
            <Badge
              variant="outline"
              className="text-[11px] font-medium border-spa-gold/30 bg-spa-gold/10 text-spa-gold gap-1"
            >
              <Layers className="h-3 w-3" />
              <span>Mixto</span>
            </Badge>
          );
        },
      },
      {
        id: 'worker',
        header: 'Especialista',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => {
          const workerName = item.workerName || 'Dueño / General';

          return (
            <div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-spa-sage shrink-0" />
                <span className="font-medium text-xs sm:text-sm text-foreground">
                  {workerName}
                </span>
              </div>
              {item.worker?.specialty && (
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {item.worker.specialty}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: 'value',
        header: 'Valor / Total',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => (
          <div>
            <div className="font-bold text-xs sm:text-sm text-foreground">
              {formatPrice(item.totalAmount)}
            </div>
            {item.serviceValue > 0 && item.productAmount > 0 ? (
              <div className="text-[10px] text-muted-foreground mt-0.5 space-y-0.5">
                <div>Servicio: {formatPrice(item.serviceValue)}</div>
                <div>Producto: {formatPrice(item.productAmount)}</div>
              </div>
            ) : item.serviceValue > 0 ? (
              <div className="text-[10px] text-spa-sage mt-0.5">
                Servicio: {formatPrice(item.serviceValue)}
              </div>
            ) : item.productAmount > 0 ? (
              <div className="text-[10px] text-spa-rose mt-0.5">
                Producto: {formatPrice(item.productAmount)}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        id: 'createdAt',
        header: 'Fecha',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider text-right',
        className: 'py-3.5 px-4 text-right',
        cell: (item) => {
          const { dateFormatted, timeFormatted } = formatDateTime(item.createdAt);
          return (
            <div>
              <div className="flex items-center justify-end gap-1.5 text-xs text-foreground font-medium capitalize">
                <Calendar className="h-3.5 w-3.5 text-spa-gold shrink-0" />
                <span>{dateFormatted}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                {timeFormatted}
              </div>
            </div>
          );
        },
      },
    ],
    [formatDateTime, formatPrice]
  );
}
