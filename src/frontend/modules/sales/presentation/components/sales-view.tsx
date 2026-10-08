'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';
import { useSales } from '../../application/use-sales';
import { SalesHeader } from './sales-header';
import { SalesTable } from './sales-table';
import { CreateSaleForm } from './create-sale-form';
import { SalesMetricsView } from './sales-metrics-view';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Lock, LogIn, Loader2, UserPlus, Calendar, LayoutDashboard } from 'lucide-react';

export function SalesView() {
  const { user, isAuthenticated, isLoading: isUserLoading } = useCurrentUser();

  const isOwner = user?.role === 'BUSINESS_OWNER' || user?.userType === 'BUSINESS';

  // State to toggle between table view, register sale form, and metrics view
  const [isCreating, setIsCreating] = React.useState<boolean>(false);
  const [isViewingMetrics, setIsViewingMetrics] = React.useState<boolean>(false);

  // Filter states
  const [page, setPage] = React.useState<number>(1);
  const [itemTypeFilter, setItemTypeFilter] = React.useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');

  const {
    items,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    isLoading: isSalesLoading,
    isFetching,
    refetch,
  } = useSales({
    page,
    limit: 10,
    itemType: itemTypeFilter,
  });

  const handleItemTypeFilterChange = (newType: 'ALL' | 'PRODUCT' | 'SERVICE') => {
    setItemTypeFilter(newType);
    setPage(1); // Reset to page 1 on filter change
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
          Cargando módulo de ventas...
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Obteniendo registros y validando permisos de acceso
        </p>
      </div>
    );
  }

  // 2. Unauthenticated state
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
            Para consultar las ventas y registrar compras de productos físicos, debes iniciar sesión en AuraSpa.
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

  // 3. Worker restriction (Workers only access Dashboard and Appointments)
  if (isAuthenticated && !isOwner) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center px-4">
        <Card className="border-border/80 shadow-xl p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">
            Acceso Restringido
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            La gestión global de ventas y facturación está reservada para el propietario del spa. Como colaboradora, tu acceso está habilitado únicamente para el <strong>Panel de Control</strong> y la <strong>Agenda de Citas</strong>.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="sm" variant="default" className="w-full gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Panel del Spa</span>
              </Button>
            </Link>
            <Link href="/citas" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                <span>Ver Mis Citas</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Authenticated View (Owner)
  return (
    <div className="space-y-6">
      <SalesHeader
        currentItemTypeFilter={itemTypeFilter}
        onItemTypeFilterChange={handleItemTypeFilterChange}
        totalSales={total}
        isOwner={isOwner}
        isRefreshing={isFetching}
        onRefresh={() => refetch()}
        userName={user.name}
        isCreating={isCreating}
        onToggleCreate={() => {
          setIsCreating((prev) => !prev);
          setIsViewingMetrics(false);
        }}
        isViewingMetrics={isViewingMetrics}
        onToggleMetrics={() => {
          setIsViewingMetrics((prev) => !prev);
          setIsCreating(false);
        }}
      />

      {isCreating ? (
        <CreateSaleForm
          onSuccess={() => {
            // Immediately return to table view on successful sale registration
            setIsCreating(false);
            refetch();
          }}
          onCancel={() => setIsCreating(false)}
        />
      ) : isViewingMetrics ? (
        <SalesMetricsView
          businessId={user.businessId}
          onBackToTable={() => setIsViewingMetrics(false)}
        />
      ) : (
        <SalesTable
          sales={items}
          isLoading={isSalesLoading}
          page={page}
          limit={10}
          total={total}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
