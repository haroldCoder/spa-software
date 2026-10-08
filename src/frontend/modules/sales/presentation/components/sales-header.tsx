'use client';

import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  RefreshCw,
  ShoppingBag,
  PackagePlus,
  ArrowLeft,
  Package,
  Scissors,
  Layers,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SalesHeaderProps {
  currentItemTypeFilter: 'ALL' | 'PRODUCT' | 'SERVICE';
  onItemTypeFilterChange: (type: 'ALL' | 'PRODUCT' | 'SERVICE') => void;
  totalSales: number;
  isOwner: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  userName?: string;
  isCreating: boolean;
  onToggleCreate: () => void;
  isViewingMetrics?: boolean;
  onToggleMetrics?: () => void;
}

export function SalesHeader({
  currentItemTypeFilter,
  onItemTypeFilterChange,
  totalSales,
  isOwner,
  isRefreshing,
  onRefresh,
  userName,
  isCreating,
  onToggleCreate,
  isViewingMetrics = false,
  onToggleMetrics,
}: SalesHeaderProps) {
  const filterTabs: { value: 'ALL' | 'PRODUCT' | 'SERVICE'; label: string; icon: typeof Layers }[] = [
    { value: 'ALL', label: 'Todas las Ventas', icon: Layers },
    { value: 'PRODUCT', label: 'Productos Físicos', icon: Package },
    { value: 'SERVICE', label: 'Servicios', icon: Scissors },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/95 to-accent/20 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="spa" className="text-xs px-2.5 py-0.5 font-semibold">
                <ShoppingBag className="h-3 w-3 mr-1" />
                {isOwner ? 'Control de Ventas & POS' : 'Mis Ventas'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {totalSales} {totalSales === 1 ? 'Venta' : 'Ventas'} Registradas
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
              Registro & Control de Ventas
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {isOwner
                ? `Bienvenido${userName ? `, ${userName}` : ''}. Monitorea las ventas de productos físicos y servicios, con tarifas y clientes asociados.`
                : `Bienvenida${userName ? `, ${userName}` : ''}. Consulta el historial de ventas y registra la salida de productos físicos para tus clientes.`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
              <span>Actualizar</span>
            </Button>

            {onToggleMetrics && !isCreating && (
              <Button
                id="sales-metrics-toggle-button"
                variant={isViewingMetrics ? 'default' : 'outline'}
                size="sm"
                onClick={onToggleMetrics}
                className={cn(
                  'gap-2 cursor-pointer transition-all duration-200',
                  isViewingMetrics
                    ? 'bg-spa-rose text-white hover:bg-spa-rose/90 shadow-md shadow-spa-rose/25 font-semibold'
                    : 'border-border/80 hover:border-spa-rose/50 hover:text-spa-rose hover:bg-accent/40'
                )}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{isViewingMetrics ? 'Ver Tabla' : 'Métricas'}</span>
              </Button>
            )}

            <Button
              id="sales-create-product-button"
              size="sm"
              onClick={onToggleCreate}
              className="gap-2 bg-gradient-to-r from-spa-rose to-spa-blush text-white hover:opacity-90 shadow-md shadow-spa-rose/25 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Ver Tabla</span>
                </>
              ) : (
                <>
                  <PackagePlus className="h-4 w-4" />
                  <span>Vender Producto</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Visible when not creating and not viewing metrics) */}
      {!isCreating && !isViewingMetrics && (
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentItemTypeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onItemTypeFilterChange(tab.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-spa-rose text-white shadow-sm shadow-spa-rose/30 font-semibold'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
