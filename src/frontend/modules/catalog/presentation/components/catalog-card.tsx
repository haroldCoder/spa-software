'use client';

import { Clock, Package, Sparkles, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { CatalogItem, CatalogItemType } from '../../domain/catalog.types';

interface CatalogCardProps {
  item: CatalogItem;
}

export function CatalogCard({ item }: CatalogCardProps) {
  const isService = item.itemType === CatalogItemType.SERVICE;
  const hasImage = Boolean(item.imageUrl);

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(item.price);

  return (
    <article
      id={`catalog-card-${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-spa-rose/40 hover:shadow-lg hover:shadow-spa-rose/10"
    >
      {/* Top Media / Thumbnail Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-spa-cream/40 via-muted to-spa-rose/10">
        {hasImage ? (
          <img
            src={item.imageUrl!}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-spa-rose/15 text-spa-rose shadow-inner transition-transform duration-300 group-hover:scale-110">
              {isService ? <Sparkles className="h-6 w-6" /> : <Package className="h-6 w-6" />}
            </div>
            <span className="mt-2 text-[11px] font-medium text-muted-foreground/80">
              {item.category}
            </span>
          </div>
        )}

        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <Badge
            variant={isService ? 'spa' : 'secondary'}
            className="shadow-sm backdrop-blur-md font-semibold text-[11px] px-2.5 py-0.5"
          >
            {isService ? 'Servicio' : 'Producto'}
          </Badge>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-md shadow-sm ${item.isActive
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'bg-muted/80 text-muted-foreground border border-border'
              }`}
          >
            {item.isActive ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>Activo</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                <span>Inactivo</span>
              </>
            )}
          </span>
        </div>

        {/* Floating Category Pill bottom-left of image */}
        <div className="absolute bottom-2.5 left-3">
          <span className="inline-flex items-center gap-1 rounded-lg bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-md shadow-sm border border-border/50">
            <Tag className="h-3 w-3 text-spa-rose" />
            {item.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-foreground line-clamp-1 group-hover:text-spa-rose transition-colors">
            {item.name}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
            {item.description || 'Sin descripción detallada registrada para este artículo.'}
          </p>
        </div>

        {/* Footer Meta & Price */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
          {/* Left Meta: Duration (if service) or Stock (if product) */}
          <div className="text-xs text-muted-foreground">
            {isService ? (
              <div className="flex items-center gap-1 font-medium text-foreground/80">
                <Clock className="h-3.5 w-3.5 text-spa-rose" />
                <span>{item.durationMinutes ? `${item.durationMinutes} min` : 'Sin definir'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 font-medium text-foreground/80">
                <Package className="h-3.5 w-3.5 text-spa-gold" />
                <span>
                  {item.stockQuantity !== undefined
                    ? `${item.stockQuantity} unid${item.stockQuantity === 1 ? '' : 's'}`
                    : 'Sin inventario'}
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            <span className="text-sm sm:text-base font-bold text-foreground font-sans">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
