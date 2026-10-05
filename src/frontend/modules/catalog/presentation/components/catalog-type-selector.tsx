'use client';

import { Sparkles, Package } from 'lucide-react';
import { CatalogItemType } from '../../domain/catalog.types';

interface CatalogTypeSelectorProps {
  value: CatalogItemType;
  onChange: (type: CatalogItemType) => void;
  disabled?: boolean;
}

export function CatalogTypeSelector({ value, onChange, disabled }: CatalogTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Tipo de Artículo
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* Service Option */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(CatalogItemType.SERVICE)}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${value === CatalogItemType.SERVICE
              ? 'border-spa-rose bg-spa-rose/10 text-foreground ring-1 ring-spa-rose/30 shadow-sm'
              : 'border-border/70 bg-card hover:bg-muted/40 text-muted-foreground'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${value === CatalogItemType.SERVICE
                ? 'bg-spa-rose text-white shadow-sm'
                : 'bg-muted text-muted-foreground'
              }`}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-xs sm:text-sm text-foreground">
              Servicio de Spa
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Uñas, masajes, faciales con duración definida.
            </div>
          </div>
        </button>

        {/* Product Option */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(CatalogItemType.PRODUCT)}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${value === CatalogItemType.PRODUCT
              ? 'border-spa-gold bg-spa-gold/10 text-foreground ring-1 ring-spa-gold/30 shadow-sm'
              : 'border-border/70 bg-card hover:bg-muted/40 text-muted-foreground'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${value === CatalogItemType.PRODUCT
                ? 'bg-spa-gold text-white shadow-sm'
                : 'bg-muted text-muted-foreground'
              }`}
          >
            <Package className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-xs sm:text-sm text-foreground">
              Producto Físico
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Cremas, aceites, kits de belleza e inventario.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
