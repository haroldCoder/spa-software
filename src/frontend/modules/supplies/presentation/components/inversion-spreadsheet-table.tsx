'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { SupplyItem, SupplyFilter, SupplyItemType } from '../../domain/supplies.types';
import { SUPPLY_TYPE_LABELS } from '../../domain/constants';
import { EditableCellState } from '../../application/use-inversion-spreadsheet';
import { useInversionColumns } from '../hooks/use-inversion-columns';
import { DataTable } from '@/src/frontend/shared/presentation/components/data-table';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Search,
  Plus,
  AlertTriangle,
  X,
  Loader2,
  HelpCircle,
} from 'lucide-react';

interface InversionSpreadsheetTableProps {
  supplies: SupplyItem[];
  isLoading: boolean;
  filters: SupplyFilter;
  onFilterChange: (filters: Partial<SupplyFilter>) => void;
  availableCategories: string[];
  activeCell: EditableCellState | null;
  savingId: string | null;
  onStartEditing: (supply: SupplyItem, field: keyof SupplyItem) => void;
  onCancelEditing: () => void;
  onCommitEdit: (supply: SupplyItem) => void;
  onSetActiveCell: React.Dispatch<React.SetStateAction<EditableCellState | null>>;
  onOpenCreateModal: () => void;
  onOpenMovementModal: (supply: SupplyItem) => void;
  onDeleteSupply: (id: string) => Promise<void>;
  totalPages?: number;
  totalItems?: number;
  currency?: string;
}

export function InversionSpreadsheetTable({
  supplies,
  isLoading,
  filters,
  onFilterChange,
  availableCategories,
  activeCell,
  savingId,
  onStartEditing,
  onCancelEditing,
  onCommitEdit,
  onSetActiveCell,
  onOpenCreateModal,
  onOpenMovementModal,
  onDeleteSupply,
  totalPages = 1,
  totalItems = 0,
  currency = 'COP',
}: InversionSpreadsheetTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto foco cuando se entra en edición de celda
  useEffect(() => {
    if (activeCell && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [activeCell]);

  // Hook modular que genera las columnas de la tabla interactiva
  const columns = useInversionColumns({
    activeCell,
    savingId,
    inputRef,
    onStartEditing,
    onCancelEditing,
    onCommitEdit,
    onSetActiveCell,
    onOpenMovementModal,
    onDeleteSupply,
    currency,
  });

  // Manejo de búsqueda con enter o botón
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput, page: 1 });
  };

  return (
    <div className="space-y-4">
      {/* Barra de Controles y Herramientas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/70 shadow-sm">
        {/* Buscador */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar insumo, categoría o proveedor..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onFilterChange({ search: '', page: 1 });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 px-3 text-xs">
            Buscar
          </Button>
        </form>

        {/* Filtros rápidos y botón agregar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Tipo */}
          <select
            value={filters.itemType ?? 'ALL'}
            onChange={(e) => onFilterChange({ itemType: e.target.value as SupplyItemType | 'ALL', page: 1 })}
            className="h-9 px-2.5 text-xs rounded-xl border border-input bg-background text-foreground"
          >
            <option value="ALL">Todos los tipos</option>
            {(Object.keys(SUPPLY_TYPE_LABELS) as SupplyItemType[]).map((type) => (
              <option key={type} value={type}>
                {SUPPLY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>

          {/* Filtro Categoría */}
          {availableCategories.length > 0 && (
            <select
              value={filters.category ?? ''}
              onChange={(e) => onFilterChange({ category: e.target.value, page: 1 })}
              className="h-9 px-2.5 text-xs rounded-xl border border-input bg-background text-foreground"
            >
              <option value="">Todas las categorías</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Botón Alertas de Stock Bajo */}
          <Button
            type="button"
            variant={filters.lowStockOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange({ lowStockOnly: !filters.lowStockOnly, page: 1 })}
            className={`h-9 text-xs gap-1.5 ${filters.lowStockOnly
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Por agotar
          </Button>

          {/* BOTÓN PRINCIPAL + AGREGAR INSUMO */}
          <Button
            type="button"
            onClick={onOpenCreateModal}
            className="h-9 bg-spa-rose hover:bg-spa-rose/90 text-white font-semibold text-xs gap-1.5 shadow-sm shadow-spa-rose/25 ml-auto sm:ml-0"
          >
            <Plus className="h-4 w-4" />
            Agregar Insumo
          </Button>
        </div>
      </div>

      {/* Banner Informativo de uso tipo Excel */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-spa-rose" />
          <span>
            <strong className="text-foreground">Modo Hoja de Cálculo:</strong> Haz clic en cualquier celda para editarla directamente. Presiona <kbd className="px-1 py-0.5 rounded bg-muted border font-mono text-[10px]">Enter</kbd> o sal de la celda para autoguardar.
          </span>
        </div>
        <span className="hidden sm:inline font-medium">
          Total: {totalItems} {totalItems === 1 ? 'insumo' : 'insumos'}
        </span>
      </div>

      {/* Tabla Compartida DataTable con soporte Excel */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-spa-rose" />
              <span>Cargando inventario de insumos...</span>
            </div>
          </div>
        ) : (
          <DataTable<SupplyItem>
            data={supplies}
            columns={columns}
            keyExtractor={(item) => item.id}
            className="border-0 rounded-none shadow-none"
            tableClassName="text-xs border-collapse"
            stickyHeader={true}
            emptyMessage="No hay insumos registrados con los filtros seleccionados. Presiona '+ Agregar Insumo' para registrar el primero."
          />
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2 text-xs text-muted-foreground">
          <span>
            Página {filters.page ?? 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) <= 1}
              onClick={() => onFilterChange({ page: (filters.page ?? 1) - 1 })}
              className="h-8 text-xs"
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(filters.page ?? 1) >= totalPages}
              onClick={() => onFilterChange({ page: (filters.page ?? 1) + 1 })}
              className="h-8 text-xs"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
