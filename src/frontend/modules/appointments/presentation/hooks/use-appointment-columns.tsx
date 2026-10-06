import * as React from 'react';
import { AppointmentItem } from '../../domain/appointment.types';
import { AppointmentStatusSelect } from '../components/appointment-status-select';
import { ColumnDef } from '@/src/frontend/shared/presentation/components/data-table';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Eye,
} from 'lucide-react';

interface UseAppointmentColumnsOptions {
  currency?: string;
  onViewNote?: (appointment: AppointmentItem) => void;
}

export function useAppointmentColumns({
  currency = 'COP',
  onViewNote,
}: UseAppointmentColumnsOptions = {}): ColumnDef<AppointmentItem>[] {
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

  return React.useMemo<ColumnDef<AppointmentItem>[]>(
    () => [
      {
        id: 'client',
        header: 'Cliente',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => {
          const clientName = item.client
            ? `${item.client.firstName} ${item.client.lastName}`
            : 'Cliente General';
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
        id: 'service',
        header: 'Servicio',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => {
          const serviceName = item.service ? item.service.name : 'Servicio General';
          return (
            <div>
              <div className="flex items-center gap-2">
                <Scissors className="h-3.5 w-3.5 text-spa-rose shrink-0" />
                <span className="font-medium text-xs sm:text-sm text-foreground">
                  {serviceName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{item.durationMinutes} min</span>
                {item.service?.category && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-muted rounded">
                    {item.service.category}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'worker',
        header: 'Especialista',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => {
          const workerName = item.worker
            ? `${item.worker.firstName} ${item.worker.lastName}`
            : 'Sin Asignar';

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
        id: 'scheduledAt',
        header: 'Fecha y Hora',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => {
          const { dateFormatted, timeFormatted } = formatDateTime(item.scheduledAt);
          return (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium capitalize">
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
      {
        id: 'price',
        header: 'Tarifa',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => (
          <div className="font-semibold text-xs sm:text-sm text-foreground">
            {formatPrice(item.price)}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Estado (Acción)',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider',
        className: 'py-3.5 px-4',
        cell: (item) => (
          <AppointmentStatusSelect
            appointmentId={item.id}
            currentStatus={item.status}
          />
        ),
      },
      {
        id: 'notes',
        header: 'Notas',
        headerClassName: 'py-3.5 px-4 font-semibold text-[11px] uppercase tracking-wider text-center',
        className: 'py-3.5 px-4 text-center',
        cell: (item) => {
          const hasNotes = Boolean(item.notes?.trim() || item.cancellationReason?.trim());
          return (
            <div className="flex items-center justify-center">
              <Button
                type="button"
                variant={hasNotes ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => onViewNote?.(item)}
                className={cn(
                  'h-7 px-2.5 text-xs font-medium gap-1.5 transition-all shadow-none',
                  hasNotes
                    ? 'border-spa-rose/30 text-spa-rose hover:bg-spa-rose/10 hover:text-spa-rose'
                    : 'text-muted-foreground hover:bg-muted/60'
                )}
                title={hasNotes ? 'Ver notas de la cita' : 'Ver detalle (sin notas)'}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Ver</span>
                {hasNotes && (
                  <span className="h-1.5 w-1.5 rounded-full bg-spa-rose shrink-0" />
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    [formatDateTime, formatPrice, onViewNote]
  );
}
