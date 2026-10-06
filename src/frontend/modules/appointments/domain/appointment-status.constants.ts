import { AppointmentStatus } from './appointment.types';

export interface AppointmentStatusConfig {
  value: AppointmentStatus;
  label: string;
  description: string;
  badgeClass: string;
  dotClass: string;
  bgLight: string;
}

export const APPOINTMENT_STATUSES: Record<AppointmentStatus, AppointmentStatusConfig> = {
  PENDING: {
    value: 'PENDING',
    label: 'Pendiente',
    description: 'En espera de confirmación',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-500',
    bgLight: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
  CONFIRMED: {
    value: 'CONFIRMED',
    label: 'Confirmada',
    description: 'Cita acordada y en agenda',
    badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
    dotClass: 'bg-sky-500',
    bgLight: 'bg-sky-50/50 dark:bg-sky-950/20',
  },
  COMPLETED: {
    value: 'COMPLETED',
    label: 'Completada',
    description: 'Servicio realizado con éxito',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
    bgLight: 'bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  CANCELLED: {
    value: 'CANCELLED',
    label: 'Cancelada',
    description: 'Cita anulada por el cliente o spa',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-500',
    bgLight: 'bg-rose-50/50 dark:bg-rose-950/20',
  },
  NO_SHOW: {
    value: 'NO_SHOW',
    label: 'No Asistió',
    description: 'Cliente ausente a la hora de cita',
    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-500',
    bgLight: 'bg-slate-50/50 dark:bg-slate-950/20',
  },
};

export const APPOINTMENT_STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'NO_SHOW', label: 'No Asistió' },
];
