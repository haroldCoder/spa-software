'use client';

import * as React from 'react';
import { AppointmentItem } from '../../domain/appointment.types';
import { AppointmentsPagination } from './appointments-pagination';
import { DataTable } from '@/src/frontend/shared/presentation/components/data-table';
import { NotesOverlay } from '@/src/frontend/shared/presentation/components/notes-overlay';
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
  const [selectedAppointmentForNotes, setSelectedAppointmentForNotes] =
    React.useState<AppointmentItem | null>(null);

  const columns = useAppointmentColumns({
    currency,
    onViewNote: (item) => setSelectedAppointmentForNotes(item),
  });

  const selectedClientName = selectedAppointmentForNotes?.client
    ? `${selectedAppointmentForNotes.client.firstName} ${selectedAppointmentForNotes.client.lastName}`
    : selectedAppointmentForNotes
    ? 'Cliente General'
    : undefined;

  const selectedDateText = React.useMemo(() => {
    if (!selectedAppointmentForNotes) return undefined;
    try {
      const d = new Date(selectedAppointmentForNotes.scheduledAt);
      return new Intl.DateTimeFormat('es-CO', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return selectedAppointmentForNotes.scheduledAt;
    }
  }, [selectedAppointmentForNotes]);

  return (
    <>
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

      {/* Shared Notes Overlay */}
      <NotesOverlay
        isOpen={Boolean(selectedAppointmentForNotes)}
        onClose={() => setSelectedAppointmentForNotes(null)}
        title="Notas de la Cita"
        subtitle={selectedAppointmentForNotes?.id ? `ID: #${selectedAppointmentForNotes.id.slice(0, 8)}` : undefined}
        clientName={selectedClientName}
        serviceName={selectedAppointmentForNotes?.service?.name}
        dateText={selectedDateText}
        notes={selectedAppointmentForNotes?.notes}
        cancellationReason={selectedAppointmentForNotes?.cancellationReason}
      />
    </>
  );
}
