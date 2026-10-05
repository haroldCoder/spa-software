'use client';

import { Sparkles, PlusCircle, SearchX } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { CatalogCard } from './catalog-card';
import { CatalogItem } from '../../domain/catalog.types';

interface CatalogCardsGridProps {
  items: CatalogItem[];
  isLoading: boolean;
  totalCatalogCount: number;
  onOpenCreateModal?: () => void;
  onResetFilters?: () => void;
}

export function CatalogCardsGrid({
  items,
  isLoading,
  totalCatalogCount,
  onOpenCreateModal,
  onResetFilters,
}: CatalogCardsGridProps) {
  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 animate-pulse"
          >
            <div className="aspect-[16/10] w-full bg-muted/70" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded-md bg-muted/80" />
              <div className="h-3.5 w-full rounded bg-muted/50" />
              <div className="h-3.5 w-2/3 rounded bg-muted/50" />
              <div className="pt-3 border-t border-border/40 flex justify-between">
                <div className="h-4 w-16 rounded bg-muted/70" />
                <div className="h-5 w-20 rounded bg-muted/70" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Entire Catalog Empty (No items created yet)
  if (totalCatalogCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/80 bg-card/40 p-8 sm:p-12 text-center backdrop-blur-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-spa-rose/10 text-spa-rose shadow-inner mb-4">
          <Sparkles className="h-8 w-8" />
        </div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Tu catálogo aún está vacío
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          Comienza registrando tus servicios de spa (ej. arreglo de uñas, manicura rusa, masajes) o
          productos cosméticos para tus clientes con sus fotos en Supabase Storage.
        </p>
        {onOpenCreateModal && (
          <Button
            id="empty-state-create-btn"
            onClick={onOpenCreateModal}
            className="mt-6 gap-2 bg-gradient-to-r from-spa-rose to-spa-blush text-white shadow-md shadow-spa-rose/25 hover:shadow-spa-rose/40"
          >
            <PlusCircle className="h-4 w-4" />
            Registrar Primer Servicio o Producto
          </Button>
        )}
      </div>
    );
  }

  // Filter Result Empty (Items exist, but none match current search/filter)
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border/60 bg-card/30 p-8 sm:p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
          <SearchX className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No encontramos coincidencias</h3>
        <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground">
          Prueba cambiando el término de búsqueda o seleccionando otra categoría de servicio o producto.
        </p>
        {onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-4 text-xs">
            Restablecer Filtros
          </Button>
        )}
      </div>
    );
  }

  // Standard Grid
  return (
    <div
      id="catalog-items-grid"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {items.map((item) => (
        <CatalogCard key={item.id} item={item} />
      ))}
    </div>
  );
}
