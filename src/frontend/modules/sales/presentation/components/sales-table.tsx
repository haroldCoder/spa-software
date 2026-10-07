'use client';

import { SaleItem } from '../../domain/sales.types';
import { SalesPagination } from './sales-pagination';
import { DataTable } from '@/src/frontend/shared/presentation/components/data-table';
import { useSalesColumns } from '../hooks/use-sales-columns';
import { Loader2 } from 'lucide-react';

interface SalesTableProps {
  sales: SaleItem[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (newPage: number) => void;
  currency?: string;
}

export function SalesTable({
  sales,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  currency = 'COP',
}: SalesTableProps) {
  const columns = useSalesColumns({ currency });

  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-spa-rose/10 text-spa-rose mb-3 animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground">
            Cargando historial de ventas...
          </p>
        </div>
      ) : (
        <DataTable
          data={sales}
          columns={columns}
          keyExtractor={(item) => item.id}
          className="border-0 rounded-none shadow-none"
          emptyMessage="No hay ventas registradas con los filtros seleccionados. Al registrar ventas de productos o servicios aparecerán aquí automáticamente."
        />
      )}

      {/* Pagination Footer limited to 10 items */}
      <SalesPagination
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
