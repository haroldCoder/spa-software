'use client';

import { DollarSign, Clock, Layers, Barcode } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { CatalogItemType } from '../../domain/catalog.types';

interface CatalogPricingFieldsProps {
  itemType: CatalogItemType;
  price: string;
  costPrice: string;
  durationMinutes: string;
  stockQuantity: string;
  minStockThreshold: string;
  sku: string;
  onChange: (
    field:
      | 'price'
      | 'costPrice'
      | 'durationMinutes'
      | 'stockQuantity'
      | 'minStockThreshold'
      | 'sku',
    value: string
  ) => void;
  disabled?: boolean;
}

export function CatalogPricingFields({
  itemType,
  price,
  costPrice,
  durationMinutes,
  stockQuantity,
  minStockThreshold,
  sku,
  onChange,
  disabled,
}: CatalogPricingFieldsProps) {
  const isService = itemType === CatalogItemType.SERVICE;

  return (
    <div className="space-y-4">
      {/* Pricing Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sale Price */}
        <div className="space-y-1.5">
          <label
            htmlFor="catalog-price-input"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
          >
            <DollarSign className="h-3.5 w-3.5 text-spa-rose" />
            <span>Precio de Venta (COP)</span>
            <span className="text-destructive">*</span>
          </label>
          <Input
            id="catalog-price-input"
            type="number"
            min="0"
            step="1000"
            value={price}
            onChange={(e) => onChange('price', e.target.value)}
            placeholder="Ej. 45000"
            disabled={disabled}
            required
            className="bg-card font-semibold"
          />
        </div>

        {/* Cost Price */}
        <div className="space-y-1.5">
          <label
            htmlFor="catalog-cost-input"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Costo Interno (COP - Opcional)
          </label>
          <Input
            id="catalog-cost-input"
            type="number"
            min="0"
            step="1000"
            value={costPrice}
            onChange={(e) => onChange('costPrice', e.target.value)}
            placeholder="Ej. 18000"
            disabled={disabled}
            className="bg-card"
          />
        </div>
      </div>

      {/* Conditional Fields based on Service vs Product */}
      {isService ? (
        /* Service duration */
        <div className="space-y-1.5">
          <label
            htmlFor="catalog-duration-input"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
          >
            <Clock className="h-3.5 w-3.5 text-spa-rose" />
            <span>Duración Estimada (Minutos)</span>
            <span className="text-destructive">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              id="catalog-duration-input"
              type="number"
              min="5"
              step="5"
              value={durationMinutes}
              onChange={(e) => onChange('durationMinutes', e.target.value)}
              placeholder="Ej. 45"
              disabled={disabled}
              required
              className="bg-card"
            />
            {/* Quick duration presets */}
            <div className="flex items-center gap-1">
              {[30, 45, 60, 90].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange('durationMinutes', String(dur))}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${durationMinutes === String(dur)
                      ? 'bg-spa-rose text-white shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                    }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Product inventory & SKU */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stock Quantity */}
            <div className="space-y-1.5">
              <label
                htmlFor="catalog-stock-input"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
              >
                <Layers className="h-3.5 w-3.5 text-spa-gold" />
                <span>Unidades en Inventario</span>
              </label>
              <Input
                id="catalog-stock-input"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => onChange('stockQuantity', e.target.value)}
                placeholder="Ej. 15"
                disabled={disabled}
                className="bg-card"
              />
            </div>

            {/* Min Stock Alert */}
            <div className="space-y-1.5">
              <label
                htmlFor="catalog-minstock-input"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Alerta de Stock Mínimo
              </label>
              <Input
                id="catalog-minstock-input"
                type="number"
                min="0"
                value={minStockThreshold}
                onChange={(e) => onChange('minStockThreshold', e.target.value)}
                placeholder="Ej. 3"
                disabled={disabled}
                className="bg-card"
              />
            </div>
          </div>

          {/* SKU / Code */}
          <div className="space-y-1.5">
            <label
              htmlFor="catalog-sku-input"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
            >
              <Barcode className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Código SKU o Referencia (Opcional)</span>
            </label>
            <Input
              id="catalog-sku-input"
              value={sku}
              onChange={(e) => onChange('sku', e.target.value)}
              placeholder="Ej. ESM-SEM-001"
              disabled={disabled}
              className="bg-card font-mono text-xs uppercase"
            />
          </div>
        </div>
      )}
    </div>
  );
}
