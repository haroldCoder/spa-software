'use client';

import * as React from 'react';
import { AppointmentStatus } from '../../domain/appointment.types';
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_OPTIONS,
} from '../../domain/appointment-status.constants';
import { useUpdateAppointmentStatus } from '../../application/use-update-appointment-status';
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
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { mutate, isPending } = useUpdateAppointmentStatus();

  const config = APPOINTMENT_STATUSES[currentStatus] || APPOINTMENT_STATUSES.PENDING;

  // Handle outside click to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectStatus = (newStatus: AppointmentStatus) => {
    if (newStatus === currentStatus || isPending) {
      setIsOpen(false);
      return;
    }

    mutate(
      {
        id: appointmentId,
        status: newStatus,
      },
      {
        onSettled: () => {
          setIsOpen(false);
        },
      }
    );
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button styled like an AuraSpa Pill Badge */}
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={() => setIsOpen((prev) => !prev)}
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
        <ChevronDown
          className={cn(
            'h-3 w-3 shrink-0 opacity-60 transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 mt-1.5 w-44 rounded-xl border border-border/80 bg-popover/95 p-1.5 shadow-xl backdrop-blur-md z-50',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
            Cambiar estado
          </div>

          <div className="space-y-0.5">
            {APPOINTMENT_STATUS_OPTIONS.map((opt) => {
              const optConfig = APPOINTMENT_STATUSES[opt.value];
              const isSelected = opt.value === currentStatus;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectStatus(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
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
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
