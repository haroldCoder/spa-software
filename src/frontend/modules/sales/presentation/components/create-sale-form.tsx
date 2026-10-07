'use client';

import { useCreateSaleForm } from '../hooks/use-create-sale-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';
import {
  Package,
  ShoppingBag,
  User,
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Plus,
  Minus,
} from 'lucide-react';

interface CreateSaleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateSaleForm({ onSuccess, onCancel }: CreateSaleFormProps) {
  const {
    isOwner,
    clients,
    products,
    workers,
    isFormDataLoading,
    clientId,
    setClientId,
    productId,
    workerId,
    setWorkerId,
    quantity,
    unitPrice,
    setUnitPrice,
    selectedProduct,
    currentStock,
    isOutOfStock,
    calculatedTotal,
    formatPrice,
    handleProductChange,
    handleQuantityChange,
    handleSubmit,
    validationError,
    isPending,
    isSuccessFeedback,
    apiError,
  } = useCreateSaleForm({ onSuccess });

  if (isFormDataLoading) {
    return (
      <Card className="border-border/80 shadow-md p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-spa-rose/10 text-spa-rose mb-3 animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Cargando catálogo de productos y lista de clientes...
        </p>
      </Card>
    );
  }

  if (isSuccessFeedback) {
    return (
      <Card className="border-spa-sage/30 bg-spa-sage/5 shadow-md p-10 text-center animate-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-spa-sage/20 text-spa-sage mb-3">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-foreground">
          ¡Venta Registrada Exitosamente!
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Actualizando stock de inventario y regresando a la tabla de ventas...
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card shadow-lg overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="spa" className="text-xs px-2.5 py-0.5 font-semibold">
                <Package className="h-3 w-3 mr-1" />
                Venta de Producto Físico
              </Badge>
              {isOwner ? (
                <Badge variant="secondary" className="text-xs">
                  Modo Propietario
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Modo Especialista
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl sm:text-2xl font-serif font-bold">
              Registrar Salida de Producto
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              Registra la venta de un producto en stock para un cliente, asociando opcionalmente la especialista.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-1.5 self-start sm:self-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la tabla</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation & API Error banner */}
          {(validationError || apiError) && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="font-medium">
                {validationError || apiError?.message}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Selección de Cliente */}
            <div className="space-y-2">
              <Label htmlFor="sale-client" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-spa-rose" />
                <span>Cliente *</span>
              </Label>
              <select
                id="sale-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">-- Selecciona el cliente --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} {c.phone ? `- ${c.phone}` : ''}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  No hay clientes registrados en este spa aún.
                </p>
              )}
            </div>

            {/* 2. Selección de Producto Físico */}
            <div className="space-y-2">
              <Label htmlFor="sale-product" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-spa-rose" />
                <span>Producto Físico del Catálogo *</span>
              </Label>
              <select
                id="sale-product"
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">-- Selecciona un producto en stock --</option>
                {products.map((p) => {
                  const stockText = p.stockQuantity !== null && p.stockQuantity !== undefined
                    ? `(Stock: ${p.stockQuantity})`
                    : '';
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatPrice(p.price)} {stockText}
                    </option>
                  );
                })}
              </select>
              {products.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  No hay productos físicos registrados en el catálogo. Puedes agregarlos en la sección de Servicios/Catálogo.
                </p>
              )}
            </div>

            {/* 3. Cantidad y Control de Stock */}
            <div className="space-y-2">
              <Label htmlFor="sale-quantity" className="text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-spa-gold" />
                  <span>Cantidad *</span>
                </span>
                {currentStock !== null && (
                  <span className={currentStock > 0 ? 'text-spa-sage text-[11px]' : 'text-destructive text-[11px]'}>
                    Stock disponible: {currentStock} unid.
                  </span>
                )}
              </Label>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="h-10 w-10 shrink-0"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <Input
                  id="sale-quantity"
                  type="number"
                  min="1"
                  max={currentStock !== null && currentStock > 0 ? currentStock : undefined}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  disabled={isOutOfStock}
                  className="text-center font-bold text-base h-10"
                  required
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={
                    isOutOfStock ||
                    (currentStock !== null && quantity >= currentStock)
                  }
                  className="h-10 w-10 shrink-0"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {isOutOfStock && (
                <p className="text-xs text-destructive font-medium">
                  Este producto no tiene stock disponible para la venta.
                </p>
              )}
            </div>

            {/* 4. Precio Unitario */}
            <div className="space-y-2">
              <Label htmlFor="sale-price" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-spa-gold" />
                <span>Precio Unitario (COP) *</span>
              </Label>
              <Input
                id="sale-price"
                type="number"
                min="0"
                step="500"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                placeholder="0"
                className="h-10 text-foreground font-mono"
                required
              />
            </div>

            {/* 5. Especialista / Vendedor Responsable */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sale-worker" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-spa-sage" />
                <span>Especialista / Colaboradora Asignada (Opcional)</span>
              </Label>
              <select
                id="sale-worker"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                disabled={!isOwner}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <option value="">-- Dueño / General (Sin colaboradora específica) --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.firstName} {w.lastName} {w.specialty ? `(${w.specialty})` : ''}
                  </option>
                ))}
              </select>
              {!isOwner && (
                <p className="text-[11px] text-muted-foreground">
                  Como colaboradora, la venta queda automáticamente registrada bajo tu cuenta.
                </p>
              )}
            </div>
          </div>

          {/* Resumen de Venta / Previsualización */}
          {selectedProduct && (
            <div className="rounded-2xl border border-border/80 bg-accent/20 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-spa-rose/10 text-spa-rose flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm sm:text-base">
                      {selectedProduct.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {quantity} unidad(es) x {formatPrice(unitPrice)}
                    </div>
                  </div>
                </div>

                <div className="text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                    Total a Cobrar
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-serif text-foreground text-spa-rose">
                    {formatPrice(calculatedTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isPending || isOutOfStock}
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-spa-rose to-spa-blush text-white hover:opacity-90 shadow-md shadow-spa-rose/25 cursor-pointer font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando Venta...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Confirmar Venta ({formatPrice(calculatedTotal)})</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
