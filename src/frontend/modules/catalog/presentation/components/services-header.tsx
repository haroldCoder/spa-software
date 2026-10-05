'use client';

import { Search, Plus, Sparkles, Package, Layers } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { FilterTab } from '../../application/use-catalog';
import { SPA_CATALOG_CATEGORIES } from '../../domain/constants/catalog-categories';
import { CatalogItemType } from '../../domain/catalog.types';

interface ServicesHeaderProps {
  metrics: {
    total: number;
    services: number;
    products: number;
    active: number;
  };
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  isCreateOpen: boolean;
  onToggleCreate: () => void;
}

export function ServicesHeader({
  metrics,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  isCreateOpen,
  onToggleCreate,
}: ServicesHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-spa-rose/15 text-spa-rose">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-spa-rose">
              Catálogo del Spa
            </span>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Servicios & Productos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Explora y administra los tratamientos de belleza (arreglo de uñas, estética, masajes) y productos comerciales con fotos en Supabase Storage.
          </p>
        </div>

        {/* Primary Action Button */}
        <div>
          <Button
            id="toggle-register-catalog-btn"
            onClick={onToggleCreate}
            className="gap-2 bg-gradient-to-r from-spa-rose to-spa-blush text-white shadow-md shadow-spa-rose/25 hover:shadow-spa-rose/40 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{isCreateOpen ? 'Ocultar Formulario' : 'Nuevo Servicio o Producto'}</span>
          </Button>
        </div>
      </div>

      {/* Metrics Counter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-sm shadow-2xs">
          <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-spa-rose" />
            <span>Total Catálogo</span>
          </div>
          <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-foreground">
            {metrics.total}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-sm shadow-2xs">
          <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-spa-rose" />
            <span>Servicios de Spa</span>
          </div>
          <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-foreground text-spa-rose">
            {metrics.services}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-sm shadow-2xs">
          <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-spa-gold" />
            <span>Productos Físicos</span>
          </div>
          <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-foreground text-spa-gold">
            {metrics.products}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-sm shadow-2xs">
          <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500/30 text-emerald-600">
              Activos
            </Badge>
            <span>Disponibles</span>
          </div>
          <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metrics.active}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/70 p-3.5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => onTabChange('ALL')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === 'ALL'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Todos ({metrics.total})
          </button>
          <button
            type="button"
            onClick={() => onTabChange(CatalogItemType.SERVICE)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === CatalogItemType.SERVICE
              ? 'bg-spa-rose text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Servicios ({metrics.services})
          </button>
          <button
            type="button"
            onClick={() => onTabChange(CatalogItemType.PRODUCT)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === CatalogItemType.PRODUCT
              ? 'bg-spa-gold text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Productos ({metrics.products})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="catalog-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, categoría o SKU..."
              className="pl-9 bg-background/80 h-9 text-xs"
            />
          </div>

          {/* Category Filter Select */}
          <div className="relative shrink-0">
            <select
              id="catalog-category-filter"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-9 rounded-xl border border-input bg-background/80 px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-spa-rose"
              aria-label="Filtrar por categoría"
            >
              <option value="ALL">Todas las categorías</option>
              {SPA_CATALOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
