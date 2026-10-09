'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';
import { useInversionSpreadsheet } from '../../application/use-inversion-spreadsheet';
import { InversionKPIs } from './inversion-kpis';
import { InversionSpreadsheetTable } from './inversion-spreadsheet-table';
import { CreateSupplyModal } from './create-supply-modal';
import { QuickMovementModal } from './quick-movement-modal';
import { SupplyItem, SupplyMovementType } from '../../domain/supplies.types';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  Plus,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export function InversionView() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useCurrentUser();
  const isOwner = user?.role === 'BUSINESS_OWNER' || user?.userType === 'BUSINESS';
  const businessId = user?.businessId;

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [movementModalState, setMovementModalState] = useState<{
    isOpen: boolean;
    supply: SupplyItem | null;
    initialType: SupplyMovementType;
  }>({
    isOpen: false,
    supply: null,
    initialType: SupplyMovementType.PURCHASE,
  });

  const {
    filters,
    setFilters,
    supplies,
    pagination,
    isLoading,
    isRefetching,
    summary,
    isSummaryLoading,
    activeCell,
    savingId,
    startEditing,
    cancelEditing,
    commitEdit,
    setActiveCell,
    toastMessage,
    availableCategories,
    createMutation,
    deleteMutation,
    registerMovementMutation,
    refetch,
  } = useInversionSpreadsheet(businessId);

  if (isAuthLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-spa-rose" />
        <span className="text-sm">Verificando sesión...</span>
      </div>
    );
  }

  if (!isAuthenticated || !isOwner || !businessId) {
    return (
      <Card className="border-border/80 shadow-md p-10 text-center max-w-lg mx-auto my-12">
        <CardContent className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Acceso Restringido</h2>
            <p className="text-sm text-muted-foreground mt-2">
              El módulo de Inversión, Costos e Inventario de Insumos está reservado exclusivamente para el dueño del negocio.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleOpenMovementModal = (
    supply: SupplyItem,
    type: SupplyMovementType = SupplyMovementType.PURCHASE
  ) => {
    setMovementModalState({
      isOpen: true,
      supply,
      initialType: type,
    });
  };

  const handleCloseMovementModal = () => {
    setMovementModalState((prev) => ({ ...prev, isOpen: false, supply: null }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback flotante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 backdrop-blur-md ${toastMessage.type === 'error'
              ? 'bg-destructive/90 text-white border-destructive'
              : 'bg-emerald-600/90 text-white border-emerald-500'
              }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Principal de la Vista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-spa-rose/10 text-spa-rose">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-foreground">
              Inversión & Insumos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gestión de compras, utilidades, herramientas y consumibles de cabina con hoja interactiva en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-9 text-xs gap-1.5"
            title="Recargar inventario"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <InversionKPIs
        summary={summary}
        isLoading={isSummaryLoading}
        onFilterLowStock={() =>
          setFilters((prev) => ({ ...prev, lowStockOnly: !prev.lowStockOnly, page: 1 }))
        }
        isLowStockFiltered={!!filters.lowStockOnly}
      />

      {/* Tabla Interactiva Excel */}
      <InversionSpreadsheetTable
        supplies={supplies}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        availableCategories={availableCategories}
        activeCell={activeCell}
        savingId={savingId}
        onStartEditing={startEditing}
        onCancelEditing={cancelEditing}
        onCommitEdit={commitEdit}
        onSetActiveCell={setActiveCell}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenMovementModal={(supply) => handleOpenMovementModal(supply, SupplyMovementType.PURCHASE)}
        onDeleteSupply={async (id) => {
          await deleteMutation.mutateAsync(id);
        }}
        totalPages={pagination?.totalPages}
        totalItems={pagination?.total}
      />

      {/* Modal: Crear Insumo */}
      <CreateSupplyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
        businessId={businessId}
      />

      {/* Modal: Movimiento Rápido de Stock */}
      <QuickMovementModal
        isOpen={movementModalState.isOpen}
        onClose={handleCloseMovementModal}
        supply={movementModalState.supply}
        initialType={movementModalState.initialType}
        onSubmit={async (supplyId, payload) => {
          await registerMovementMutation.mutateAsync({ supplyId, payload });
        }}
        businessId={businessId}
      />
    </div>
  );
}
