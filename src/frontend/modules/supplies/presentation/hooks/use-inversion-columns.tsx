'use client';

import * as React from 'react';
import { useMemo, useCallback } from 'react';
import {
  SupplyItem,
  SupplyItemType,
  SupplyUnitMeasure,
} from '../../domain/supplies.types';
import {
  SUPPLY_TYPE_LABELS,
  SUPPLY_TYPE_BADGE_VARIANT,
  SUPPLY_UNIT_LABELS,
} from '../../domain/constants';
import { EditableCellState } from '../../application/use-inversion-spreadsheet';
import { ColumnDef } from '@/src/frontend/shared/presentation/components/data-table';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { AlertTriangle, Loader2, ShoppingCart, Trash2 } from 'lucide-react';

export interface UseInversionColumnsOptions {
  activeCell: EditableCellState | null;
  savingId: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onStartEditing: (supply: SupplyItem, field: keyof SupplyItem) => void;
  onCancelEditing: () => void;
  onCommitEdit: (supply: SupplyItem) => void;
  onSetActiveCell: React.Dispatch<React.SetStateAction<EditableCellState | null>>;
  onOpenMovementModal: (supply: SupplyItem) => void;
  onDeleteSupply: (id: string) => Promise<void>;
  currency?: string;
}

export function useInversionColumns({
  activeCell,
  savingId,
  inputRef,
  onStartEditing,
  onCancelEditing,
  onCommitEdit,
  onSetActiveCell,
  onOpenMovementModal,
  onDeleteSupply,
  currency = 'COP',
}: UseInversionColumnsOptions): ColumnDef<SupplyItem>[] {
  const formatCurrency = useCallback(
    (val?: number) => {
      try {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(val ?? 0);
      } catch {
        return `$${(val ?? 0).toLocaleString()}`;
      }
    },
    [currency]
  );

  return useMemo<ColumnDef<SupplyItem>[]>(() => [
    {
      id: 'status',
      header: 'Estado',
      headerClassName: 'w-14 text-center',
      className: 'text-center py-2.5 px-3',
      cell: (supply) => {
        const isSaving = savingId === supply.id;
        const isLow = supply.isLowStock;

        if (isSaving) {
          return <Loader2 className="h-3.5 w-3.5 animate-spin text-spa-rose mx-auto" />;
        }

        if (isLow) {
          return (
            <span
              title={`Stock bajo: ${supply.currentStock} de ${supply.minStockAlert} ${supply.unitMeasure}`}
              className="inline-flex p-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
          );
        }

        return (
          <span
            title="Stock en niveles normales"
            className="inline-block w-2 h-2 rounded-full bg-emerald-500/70"
          />
        );
      },
    },
    {
      id: 'name',
      header: 'Insumo / Nombre',
      headerClassName: 'min-w-[200px]',
      className: 'py-2.5 px-3 font-medium text-foreground cursor-cell hover:bg-primary/5 rounded',
      cell: (supply) => {
        const isEditing = activeCell?.supplyId === supply.id && activeCell?.field === 'name';

        if (isEditing) {
          return (
            <input
              ref={inputRef}
              type="text"
              value={String(activeCell.value)}
              onChange={(e) =>
                onSetActiveCell({ ...activeCell, value: e.target.value })
              }
              onBlur={() => onCommitEdit(supply)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitEdit(supply);
                if (e.key === 'Escape') onCancelEditing();
              }}
              className="w-full px-2 py-1 text-xs rounded border border-primary bg-background text-foreground shadow-sm focus:outline-none"
            />
          );
        }

        return (
          <div
            onClick={() => onStartEditing(supply, 'name')}
            className="flex flex-col cursor-cell"
          >
            <span>{supply.name}</span>
            {supply.sku && (
              <span className="text-[10px] text-muted-foreground font-mono">
                SKU: {supply.sku}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'category',
      header: 'Categoría',
      headerClassName: 'min-w-[130px]',
      className: 'py-2.5 px-3 text-muted-foreground cursor-cell hover:bg-primary/5 rounded',
      cell: (supply) => {
        const isEditing = activeCell?.supplyId === supply.id && activeCell?.field === 'category';

        if (isEditing) {
          return (
            <input
              ref={inputRef}
              type="text"
              value={String(activeCell.value)}
              onChange={(e) =>
                onSetActiveCell({ ...activeCell, value: e.target.value })
              }
              onBlur={() => onCommitEdit(supply)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitEdit(supply);
                if (e.key === 'Escape') onCancelEditing();
              }}
              className="w-full px-2 py-1 text-xs rounded border border-primary bg-background text-foreground shadow-sm focus:outline-none"
            />
          );
        }

        return (
          <div onClick={() => onStartEditing(supply, 'category')} className="cursor-cell">
            <span>{supply.category || '—'}</span>
          </div>
        );
      },
    },
    {
      id: 'itemType',
      header: 'Tipo',
      headerClassName: 'min-w-[150px]',
      className: 'py-2.5 px-3 cursor-cell hover:bg-primary/5 rounded',
      cell: (supply) => {
        const isEditing = activeCell?.supplyId === supply.id && activeCell?.field === 'itemType';

        if (isEditing) {
          return (
            <select
              value={String(activeCell.value)}
              onChange={(e) => {
                const newCell = { ...activeCell, value: e.target.value };
                onSetActiveCell(newCell);
              }}
              onBlur={() => onCommitEdit(supply)}
              className="w-full px-1.5 py-1 text-xs rounded border border-primary bg-background text-foreground focus:outline-none"
              autoFocus
            >
              {(Object.keys(SUPPLY_TYPE_LABELS) as SupplyItemType[]).map((key) => (
                <option key={key} value={key}>
                  {SUPPLY_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          );
        }

        return (
          <div onClick={() => onStartEditing(supply, 'itemType')} className="cursor-cell">
            <Badge
              variant={SUPPLY_TYPE_BADGE_VARIANT[supply.itemType] ?? 'default'}
              className="text-[10px] font-normal"
            >
              {SUPPLY_TYPE_LABELS[supply.itemType] ?? supply.itemType}
            </Badge>
          </div>
        );
      },
    },
    {
      id: 'unitMeasure',
      header: 'Unidad',
      headerClassName: 'w-24 text-center',
      className: 'py-2.5 px-3 text-center text-muted-foreground cursor-cell hover:bg-primary/5 rounded',
      cell: (supply) => {
        const isEditing = activeCell?.supplyId === supply.id && activeCell?.field === 'unitMeasure';

        if (isEditing) {
          return (
            <select
              value={String(activeCell.value)}
              onChange={(e) => {
                const newCell = { ...activeCell, value: e.target.value };
                onSetActiveCell(newCell);
              }}
              onBlur={() => onCommitEdit(supply)}
              className="w-full px-1 py-1 text-xs rounded border border-primary bg-background text-foreground focus:outline-none"
              autoFocus
            >
              {(Object.keys(SUPPLY_UNIT_LABELS) as SupplyUnitMeasure[]).map((key) => (
                <option key={key} value={key}>
                  {SUPPLY_UNIT_LABELS[key]}
                </option>
              ))}
            </select>
          );
        }

        return (
          <div onClick={() => onStartEditing(supply, 'unitMeasure')} className="cursor-cell">
            <span className="font-mono text-xs">{supply.unitMeasure}</span>
          </div>
        );
      },
    },
    {
      id: 'currentStock',
      header: 'Stock Actual',
      headerClassName: 'w-28 text-right font-bold text-foreground',
      className: 'py-2.5 px-3 text-right font-mono font-bold cursor-cell hover:bg-primary/5 rounded',
      cell: (supply) => {
        const isEditing = activeCell?.supplyId === supply.id && activeCell?.field === 'currentStock';
        const isLow = supply.isLowStock;

        if (isEditing) {
          return (
            <input
              ref={inputRef}
              type="number"
              step="any"
              value={String(activeCell.value)}
              onChange={(e) =>
                onSetActiveCell({ ...activeCell, value: e.target.value })
              }
              onBlur={() => onCommitEdit(supply)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitEdit(supply);
                if (e.key === 'Escape') onCancelEditing();
              }}
              className="w-full text-right px-2 py-1 text-xs rounded border border-primary bg-background text-foreground shadow-sm focus:outline-none font-bold"
            />
          );
        }

        return (
          <div
            onClick={() => onStartEditing(supply, 'currentStock')}
            className={`cursor-cell px-1.5 py-0.5 rounded ${
              isLow ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold' : 'text-foreground'
            }`}
          >
            <span>{supply.currentStock}</span>
          </div>
        );
      },
    },
    {
      id: 'minStockAlert',
      header: 'Mín. Alerta',
      headerClassName: 'w-24 text-right',
      className: 'py-2.5 px-3 text-right font-mono text-muted-foreground cursor-cell hover:bg-primary/5 rounded',
      cell: (supply) => {
        const isEditing = activeCell?.supplyId === supply.id && activeCell?.field === 'minStockAlert';

        if (isEditing) {
          return (
            <input
              ref={inputRef}
              type="number"
              step="any"
              value={String(activeCell.value)}
              onChange={(e) =>
                onSetActiveCell({ ...activeCell, value: e.target.value })
              }
              onBlur={() => onCommitEdit(supply)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitEdit(supply);
                if (e.key === 'Escape') onCancelEditing();
              }}
              className="w-full text-right px-2 py-1 text-xs rounded border border-primary bg-background text-foreground shadow-sm focus:outline-none"
            />
          );
        }

        return (
          <div onClick={() => onStartEditing(supply, 'minStockAlert')} className="cursor-cell">
            <span>{supply.minStockAlert}</span>
          </div>
        );
      },
    },
    {
      id: 'costPerUnit',
      header: 'Costo Unitario',
      headerClassName: 'min-w-[120px] text-right',
      className: 'py-2.5 px-3 text-right font-mono text-foreground cursor-cell hover:bg-primary/5 rounded',
      cell: (supply) => {
        const isEditing = activeCell?.supplyId === supply.id && activeCell?.field === 'costPerUnit';

        if (isEditing) {
          return (
            <input
              ref={inputRef}
              type="number"
              step="any"
              value={String(activeCell.value)}
              onChange={(e) =>
                onSetActiveCell({ ...activeCell, value: e.target.value })
              }
              onBlur={() => onCommitEdit(supply)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitEdit(supply);
                if (e.key === 'Escape') onCancelEditing();
              }}
              className="w-full text-right px-2 py-1 text-xs rounded border border-primary bg-background text-foreground shadow-sm focus:outline-none"
            />
          );
        }

        return (
          <div onClick={() => onStartEditing(supply, 'costPerUnit')} className="cursor-cell">
            <span>{formatCurrency(supply.costPerUnit)}</span>
          </div>
        );
      },
    },
    {
      id: 'totalStockValue',
      header: 'Valor Total',
      headerClassName: 'min-w-[130px] text-right font-bold text-foreground bg-spa-rose/5',
      className: 'py-2.5 px-3 text-right font-mono font-bold text-foreground bg-spa-rose/[0.04]',
      cell: (supply) => {
        return <span>{formatCurrency(supply.totalStockValue)}</span>;
      },
    },
    {
      id: 'supplier',
      header: 'Proveedor',
      headerClassName: 'min-w-[160px]',
      className: 'py-2.5 px-3 text-muted-foreground cursor-cell hover:bg-primary/5 rounded',
      cell: (supply) => {
        const isEditing = activeCell?.supplyId === supply.id && activeCell?.field === 'supplierName';

        if (isEditing) {
          return (
            <input
              ref={inputRef}
              type="text"
              value={String(activeCell.value)}
              onChange={(e) =>
                onSetActiveCell({ ...activeCell, value: e.target.value })
              }
              onBlur={() => onCommitEdit(supply)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitEdit(supply);
                if (e.key === 'Escape') onCancelEditing();
              }}
              className="w-full px-2 py-1 text-xs rounded border border-primary bg-background text-foreground shadow-sm focus:outline-none"
            />
          );
        }

        return (
          <div
            onClick={() => onStartEditing(supply, 'supplierName')}
            className="flex flex-col cursor-cell"
          >
            <span>{supply.supplierName || '—'}</span>
            {supply.supplierContact && (
              <span className="text-[10px] text-muted-foreground">
                {supply.supplierContact}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      headerClassName: 'w-24 text-center',
      className: 'py-2.5 px-3 text-center',
      cell: (supply) => {
        return (
          <div className="flex items-center justify-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
            {/* Botón Compra / Entrada Rápida */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenMovementModal(supply)}
              title="Registrar Compra / Entrada de Stock"
              className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 rounded-lg"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>

            {/* Botón Eliminar / Desactivar */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    `¿Estás seguro de que deseas desactivar el insumo "${supply.name}"?`
                  )
                ) {
                  onDeleteSupply(supply.id);
                }
              }}
              title="Desactivar insumo"
              className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ], [
    activeCell,
    formatCurrency,
    inputRef,
    onCancelEditing,
    onCommitEdit,
    onDeleteSupply,
    onOpenMovementModal,
    onSetActiveCell,
    onStartEditing,
    savingId,
  ]);
}
