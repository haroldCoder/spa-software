'use client';

import { AppointmentItem } from '../../domain/appointment.types';
import { AppointmentsPagination } from './appointments-pagination';
import { DataTable } from '@/src/frontend/shared/presentation/components/data-table';
import { useAppointmentColumns } from '../hooks/use-appointment-columns';
import { Loader2 } from 'lucide-react';

interface AppointmentsTableProps {
  appointments: AppointmentItem[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (newPage: number) => void;
  currency?: string;
  userRole?: string;
}

export function AppointmentsTable({
  appointments,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  currency = 'COP',
}: AppointmentsTableProps) {
  const columns = useAppointmentColumns({ currency });

  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-spa-rose/10 text-spa-rose mb-3 animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground">
            Cargando citas...
          </p>
        </div>
      ) : (
        <DataTable
          data={appointments}
          columns={columns}
          keyExtractor={(item) => item.id}
          className="border-0 rounded-none shadow-none"
          emptyMessage="No hay citas registradas con los filtros seleccionados. Las nuevas citas agendadas aparecerán automáticamente aquí."
        />
      )}

      {/* Pagination Footer limited to 10 items */}
      <AppointmentsPagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        onPageChange={onPageChange}
        disabled={isLoading}
      />
    </div>
  );
}
