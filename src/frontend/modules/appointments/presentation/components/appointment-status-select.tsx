'use client';

import { AppointmentStatus } from '../../domain/appointment.types';
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_OPTIONS,
} from '../../domain/appointment-status.constants';
import { useUpdateAppointmentStatus } from '../../application/use-update-appointment-status';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';
import { Loader2, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AppointmentStatusSelectProps {
  appointmentId: string;
  currentStatus: AppointmentStatus;
  disabled?: boolean;
}

export function AppointmentStatusSelect({
  appointmentId,
  currentStatus,
  disabled = false,
}: AppointmentStatusSelectProps) {
  const { mutate, isPending } = useUpdateAppointmentStatus();
  const config = APPOINTMENT_STATUSES[currentStatus] || APPOINTMENT_STATUSES.PENDING;

  const handleSelectStatus = (newStatus: AppointmentStatus) => {
    if (newStatus === currentStatus || isPending) return;

    mutate({
      id: appointmentId,
      status: newStatus,
    });
  };

  return (
    <DropdownMenu>
      {/* Trigger Button styled as an AuraSpa status pill */}
      <DropdownMenuTrigger
        disabled={disabled || isPending}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-spa-rose/30 shadow-xs cursor-pointer',
          'hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          config.badgeClass
        )}
        title="Haz clic para cambiar el estado de la cita"
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-current" />
        ) : (
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotClass)} />
        )}
        <span>{config.label}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-60 transition-transform" />
      </DropdownMenuTrigger>

      {/* Floating DropdownMenu superimposed on top of table without container clipping */}
      <DropdownMenuContent align="start" className="w-48 p-1.5 shadow-2xl">
        <DropdownMenuLabel>Cambiar estado de la cita</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="space-y-0.5">
          {APPOINTMENT_STATUS_OPTIONS.map((opt) => {
            const optConfig = APPOINTMENT_STATUSES[opt.value];
            const isSelected = opt.value === currentStatus;

            return (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => handleSelectStatus(opt.value)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-spa-rose/10 text-spa-rose font-semibold'
                    : 'text-foreground hover:bg-muted/80'
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn('h-2 w-2 rounded-full shrink-0', optConfig.dotClass)}
                  />
                  <span>{optConfig.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-spa-rose shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
