'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';
import { useAppointments } from '../../application/use-appointments';
import { AppointmentStatus } from '../../domain/appointment.types';
import { AppointmentsHeader } from './appointments-header';
import { AppointmentsTable } from './appointments-table';
import { BookAppointmentForm } from './book-appointment-form';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Lock, LogIn, Loader2, UserPlus } from 'lucide-react';

export function AppointmentsView() {
  const { user, isAuthenticated, isLoading: isUserLoading } = useCurrentUser();

  const isOwner = user?.role === 'BUSINESS_OWNER' || user?.userType === 'BUSINESS';

  // Toggle state to schedule an appointment in the same view
  const [isCreating, setIsCreating] = React.useState<boolean>(false);

  // Filters state with 10-item limit fixed as requested
  const [page, setPage] = React.useState<number>(1);
  const [statusFilter, setStatusFilter] = React.useState<AppointmentStatus | 'ALL'>('ALL');

  const {
    items,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    isLoading: isAppointmentsLoading,
    isFetching,
    refetch,
  } = useAppointments({
    page,
    limit: 10,
    status: statusFilter,
  });

  const handleStatusFilterChange = (newStatus: AppointmentStatus | 'ALL') => {
    setStatusFilter(newStatus);
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 1. Loading user state
  if (isUserLoading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-spa-rose/10 text-spa-rose mb-4 animate-pulse">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h3 className="text-lg font-serif font-bold text-foreground">
          Cargando agenda de citas...
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Obteniendo registros y sincronizando permisos del usuario
        </p>
      </div>
    );
  }

  // 2. Unauthenticated user
  if (!isAuthenticated || !user) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center px-4">
        <Card className="border-border/80 shadow-xl p-6 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Sesión Requerida
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Para consultar la tabla de citas y gestionar los estados de reserva, debes iniciar sesión como dueño de spa o como colaboradora.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Registrar Spa</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Authenticated View (Both Owner and Worker)
  return (
    <div className="space-y-6">
      <AppointmentsHeader
        currentStatusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        totalAppointments={total}
        isOwner={isOwner}
        isRefreshing={isFetching}
        onRefresh={() => refetch()}
        userName={user.name}
        isCreating={isCreating}
        onToggleCreate={() => setIsCreating((prev) => !prev)}
      />

      {isCreating ? (
        <BookAppointmentForm
          onSuccess={() => {
            // When successfully booked, immediately switch back to the table view
            setIsCreating(false);
            refetch();
          }}
          onCancel={() => setIsCreating(false)}
        />
      ) : (
        <AppointmentsTable
          appointments={items}
          isLoading={isAppointmentsLoading}
          page={page}
          limit={10}
          total={total}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onPageChange={handlePageChange}
          userRole={user.role}
        />
      )}
    </div>
  );
}
