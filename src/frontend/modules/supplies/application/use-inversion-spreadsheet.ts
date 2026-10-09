import { useState, useCallback, useMemo } from 'react';
import {
  SupplyItem,
  SupplyFilter,
  SupplyItemType,
  SupplyUnitMeasure,
  SupplyMovementType,
} from '../domain/supplies.types';
import { useSuppliesQueries } from './use-supplies-queries';
import { useSupplyMutations } from './use-supplies-mutations';

export interface EditableCellState {
  supplyId: string;
  field: keyof SupplyItem;
  value: string | number;
}

export function useInversionSpreadsheet(businessId?: string) {
  // Filtros de tabla
  const [filters, setFilters] = useState<SupplyFilter>({
    page: 1,
    limit: 20,
    search: '',
    itemType: 'ALL',
    category: '',
    lowStockOnly: false,
  });

  // Estado de celda activa en edición tipo Excel
  const [activeCell, setActiveCell] = useState<EditableCellState | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Queries y Mutaciones
  const { suppliesQuery, summaryQuery } = useSuppliesQueries(businessId, filters);
  const { updateMutation, deleteMutation, createMutation, registerMovementMutation } =
    useSupplyMutations(businessId);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Iniciar edición de una celda
  const startEditing = useCallback((supply: SupplyItem, field: keyof SupplyItem) => {
    setActiveCell({
      supplyId: supply.id,
      field,
      value: (supply[field] as string | number) ?? '',
    });
  }, []);

  // Cancelar edición
  const cancelEditing = useCallback(() => {
    setActiveCell(null);
  }, []);

  // Guardar celda editada (Excel onBlur / onEnter)
  const commitEdit = useCallback(
    async (supply: SupplyItem) => {
      if (!activeCell || activeCell.supplyId !== supply.id) return;

      const { field, value } = activeCell;
      const currentValue = supply[field];

      // Si no cambió el valor, simplemente cerramos
      if (String(currentValue ?? '') === String(value ?? '').trim()) {
        setActiveCell(null);
        return;
      }

      setSavingId(supply.id);
      setActiveCell(null);

      try {
        const payload: Record<string, unknown> = {};

        if (field === 'name') {
          payload.name = String(value).trim();
        } else if (field === 'category') {
          payload.category = String(value).trim() || null;
        } else if (field === 'itemType') {
          payload.itemType = value as SupplyItemType;
        } else if (field === 'unitMeasure') {
          payload.unitMeasure = value as SupplyUnitMeasure;
        } else if (field === 'minStockAlert') {
          payload.minStockAlert = Math.max(0, Number(value) || 0);
        } else if (field === 'costPerUnit') {
          payload.costPerUnit = Math.max(0, Number(value) || 0);
        } else if (field === 'sku') {
          payload.sku = String(value).trim() || null;
        } else if (field === 'supplierName') {
          payload.supplierName = String(value).trim() || null;
        } else if (field === 'supplierContact') {
          payload.supplierContact = String(value).trim() || null;
        } else if (field === 'currentStock') {
          // Si el usuario cambia directamente el stock en la celda, realizamos un ajuste
          const newQty = Math.max(0, Number(value) || 0);
          await registerMovementMutation.mutateAsync({
            supplyId: supply.id,
            payload: {
              businessId: supply.businessId,
              supplyId: supply.id,
              movementType: SupplyMovementType.ADJUSTMENT,
              quantity: newQty,
              unitCost: supply.costPerUnit,
              reason: 'Ajuste manual de inventario desde tabla interactiva de inversión',
            },
          });
          showToast(`Stock de "${supply.name}" ajustado a ${newQty}.`);
          setSavingId(null);
          return;
        }

        await updateMutation.mutateAsync({
          id: supply.id,
          payload,
        });

        showToast(`"${supply.name}" actualizado.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al guardar cambios';
        showToast(msg, 'error');
      } finally {
        setSavingId(null);
      }
    },
    [activeCell, registerMovementMutation, showToast, updateMutation]
  );

  // Categorías únicas detectadas de los datos cargados para filtro dinámico
  const availableCategories = useMemo(() => {
    const items = suppliesQuery.data?.items ?? [];
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [suppliesQuery.data?.items]);

  return {
    filters,
    setFilters,
    supplies: suppliesQuery.data?.items ?? [],
    pagination: suppliesQuery.data,
    isLoading: suppliesQuery.isLoading,
    isRefetching: suppliesQuery.isRefetching,
    summary: summaryQuery.data,
    isSummaryLoading: summaryQuery.isLoading,
    activeCell,
    setActiveCell,
    savingId,
    startEditing,
    cancelEditing,
    commitEdit,
    toastMessage,
    availableCategories,
    createMutation,
    deleteMutation,
    registerMovementMutation,
    refetch: suppliesQuery.refetch,
  };
}
