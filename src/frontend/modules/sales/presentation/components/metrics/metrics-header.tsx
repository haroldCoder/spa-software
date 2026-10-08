'use client';

import {
  TrendingUp,
  Target,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Award,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';

export type MetricsTab = 'overview' | 'potential-clients' | 'top-clients';

interface MetricsHeaderProps {
  totalSalesCount: number;
  potentialClientsCount: number;
  payingClientsCount: number;
  activeTab: MetricsTab;
  onTabChange: (tab: MetricsTab) => void;
  onRefresh: () => void;
  onBackToTable: () => void;
}

export function MetricsHeader({
  totalSalesCount,
  potentialClientsCount,
  payingClientsCount,
  activeTab,
  onTabChange,
  onRefresh,
  onBackToTable,
}: MetricsHeaderProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-accent/25 p-6 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="spa" className="text-xs px-2.5 py-0.5 font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              Inteligencia Comercial & Clientes
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {totalSalesCount} Transacciones Analizadas
            </Badge>
            {potentialClientsCount > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300/40"
              >
                <Target className="h-3 w-3 mr-1" />
                {potentialClientsCount} Clientes Potenciales
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight">
            Métricas de Ventas & Prospección
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Visualiza el desempeño financiero, la relación entre ventas físicas vs servicios, y el embudo de conversión de clientes potenciales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            id="metrics-refresh-button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Actualizar</span>
          </Button>
          <Button
            id="metrics-back-button"
            size="sm"
            onClick={onBackToTable}
            className="gap-2 bg-gradient-to-r from-spa-rose to-spa-blush text-white hover:opacity-90 shadow-md shadow-spa-rose/25 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ver Tabla de Ventas</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-t border-border/60 pt-4">
        <button
          id="tab-overview"
          type="button"
          onClick={() => onTabChange('overview')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer',
            activeTab === 'overview'
              ? 'bg-spa-rose text-white shadow-sm shadow-spa-rose/30 font-semibold'
              : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80'
          )}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Resumen y Gráficas</span>
        </button>

        <button
          id="tab-potential-clients"
          type="button"
          onClick={() => onTabChange('potential-clients')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer',
            activeTab === 'potential-clients'
              ? 'bg-spa-rose text-white shadow-sm shadow-spa-rose/30 font-semibold'
              : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80'
          )}
        >
          <Target className="h-3.5 w-3.5" />
          <span>Clientes Potenciales ({potentialClientsCount})</span>
        </button>

        <button
          id="tab-top-clients"
          type="button"
          onClick={() => onTabChange('top-clients')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer',
            activeTab === 'top-clients'
              ? 'bg-spa-rose text-white shadow-sm shadow-spa-rose/30 font-semibold'
              : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80'
          )}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Top Clientes Compradores ({payingClientsCount})</span>
        </button>
      </div>
    </div>
  );
}
