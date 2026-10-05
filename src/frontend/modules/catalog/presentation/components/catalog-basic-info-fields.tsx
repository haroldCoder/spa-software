'use client';

import { Tag, FileText } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { SPA_CATALOG_CATEGORIES } from '../../domain/constants/catalog-categories';
import { CatalogItemType } from '../../domain/catalog.types';


interface CatalogBasicInfoFieldsProps {
  name: string;
  category: string;
  description: string;
  itemType: CatalogItemType;
  onChange: (field: 'name' | 'category' | 'description', value: string) => void;
  disabled?: boolean;
}

export function CatalogBasicInfoFields({
  name,
  category,
  description,
  itemType,
  onChange,
  disabled,
}: CatalogBasicInfoFieldsProps) {
  const isService = itemType === CatalogItemType.SERVICE;

  const placeholderName = isService
    ? 'Ej. Arreglo de Uñas Acrílicas con Diseño'
    : 'Ej. Esmalte Semipermanente Profesional 15ml';

  return (
    <div className="space-y-4">
      {/* Name Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="catalog-name-input"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Nombre del {isService ? 'Servicio' : 'Producto'}{' '}
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="catalog-name-input"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder={placeholderName}
          disabled={disabled}
          required
          className="bg-card font-medium"
        />
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <label
          htmlFor="catalog-category-select"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
        >
          <Tag className="h-3.5 w-3.5 text-spa-rose" />
          <span>Categoría</span>
          <span className="text-destructive">*</span>
        </label>

        {/* Dropdown Select */}
        <select
          id="catalog-category-select"
          value={category}
          onChange={(e) => onChange('category', e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-spa-rose/30"
        >
          {SPA_CATALOG_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Quick Pick Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SPA_CATALOG_CATEGORIES.slice(0, 6).map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                disabled={disabled}
                onClick={() => onChange('category', cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${isSelected
                  ? 'bg-spa-rose text-white shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description Textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="catalog-description-input"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
        >
          <FileText className="h-3.5 w-3.5 text-spa-gold" />
          <span>Descripción & Beneficios (Opcional)</span>
        </label>
        <textarea
          id="catalog-description-input"
          rows={3}
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder={
            isService
              ? 'Describe los pasos, técnicas (ej. limado, cutícula, exfoliación) o productos aplicados en este servicio...'
              : 'Detalla ingredientes principales, modo de uso o tipo de piel recomendado...'
          }
          disabled={disabled}
          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-spa-rose/30"
        />
      </div>
    </div>
  );
}
