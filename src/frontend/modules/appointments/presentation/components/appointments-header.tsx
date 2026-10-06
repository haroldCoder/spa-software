'use client';

import { AppointmentStatus } from '../../domain/appointment.types';
import { APPOINTMENT_STATUS_OPTIONS } from '../../domain/appointment-status.constants';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  RefreshCw,
  Sparkles,
  Filter,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AppointmentsHeaderProps {
  currentStatusFilter: AppointmentStatus | 'ALL';
  onStatusFilterChange: (status: AppointmentStatus | 'ALL') => void;
  totalAppointments: number;
  isOwner: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  userName?: string;
}

export function AppointmentsHeader({
  currentStatusFilter,
  onStatusFilterChange,
  totalAppointments,
  isOwner,
  isRefreshing,
  onRefresh,
  userName,
}: AppointmentsHeaderProps) {
  const filterTabs: { value: AppointmentStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todas' },
    ...APPOINTMENT_STATUS_OPTIONS,
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/95 to-accent/20 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="spa" className="text-xs px-2.5 py-0.5 font-semibold">
                <Sparkles className="h-3 w-3 mr-1" />
                {isOwner ? 'Gestión Global de Citas' : 'Mi Agenda de Citas'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {totalAppointments} {totalAppointments === 1 ? 'Cita' : 'Citas'} Registradas
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Agenda & Control de Citas
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {isOwner
                ? `Bienvenido${userName ? `, ${userName}` : ''}. Supervisa y actualiza en tiempo real el estado de todas las reservas del spa.`
                : `Bienvenida${userName ? `, ${userName}` : ''}. Gestiona tus citas asignadas, confirma disponibilidad y actualiza su estado.`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 px-1 py-1 rounded-xl bg-card border border-border/70 w-full sm:w-auto">
          <div className="px-2 py-1 text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span className="hidden sm:inline">Filtrar:</span>
          </div>

          {filterTabs.map((tab) => {
            const isActive = currentStatusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusFilterChange(tab.value)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-spa-rose text-white font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
