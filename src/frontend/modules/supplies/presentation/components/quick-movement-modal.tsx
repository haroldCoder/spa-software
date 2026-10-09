'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';
import {
  SupplyItem,
  SupplyMovementType,
  RegisterMovementPayload,
} from '../../domain/supplies.types';
import { SUPPLY_MOVEMENT_LABELS } from '../../domain/constants';
import { X, Loader2, ArrowUpRight, ArrowDownRight, AlertCircle, ShoppingCart } from 'lucide-react';

interface QuickMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  supply: SupplyItem | null;
  initialType?: SupplyMovementType;
  onSubmit: (supplyId: string, payload: RegisterMovementPayload) => Promise<void>;
  businessId: string;
}

export function QuickMovementModal({
  isOpen,
  onClose,
  supply,
  initialType = SupplyMovementType.PURCHASE,
  onSubmit,
  businessId,
}: QuickMovementModalProps) {
  const [movementType, setMovementType] = useState<SupplyMovementType>(initialType);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(supply?.costPerUnit ?? 0);
  const [reason, setReason] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (supply) {
      setMovementType(initialType);
      setUnitCost(supply.costPerUnit || 0);
      setQuantity(1);
      setReason('');
      setInvoiceNumber('');
      setError(null);
    }
  }, [supply, initialType]);

  if (!isOpen || !supply) return null;

  const isPurchase = movementType === SupplyMovementType.PURCHASE;
  const isConsumption = movementType === SupplyMovementType.CONSUMPTION;
  const isWaste = movementType === SupplyMovementType.WASTE;
  const isAdjustment = movementType === SupplyMovementType.ADJUSTMENT;

  const newStockPreview = () => {
    const qty = Number(quantity) || 0;
    if (isPurchase) return supply.currentStock + qty;
    if (isConsumption || isWaste) return Math.max(0, supply.currentStock - qty);
    if (isAdjustment) return qty;
    return supply.currentStock;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 && !isAdjustment) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }

    if ((isConsumption || isWaste) && supply.currentStock < quantity) {
      setError(`Stock insuficiente. Solo tienes ${supply.currentStock} unidades disponibles.`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(supply.id, {
        businessId,
        supplyId: supply.id,
        movementType,
        quantity: Number(quantity),
        unitCost: Number(unitCost) || 0,
        reason: reason.trim() || null,
        invoiceNumber: invoiceNumber.trim() || null,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar el movimiento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg my-8">
        <Card className="border-border/80 shadow-2xl bg-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold">
                  {isPurchase ? 'Registrar Compra / Entrada' : 'Registrar Salida / Consumo'}
                </CardTitle>
                <Badge variant={isPurchase ? 'default' : 'secondary'} className="text-[10px]">
                  {supply.unitMeasure}
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Insumo: <span className="font-semibold text-foreground">{supply.name}</span> (Stock actual: {supply.currentStock})
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Selector de Tipo de Movimiento */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tipo de Movimiento</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType(SupplyMovementType.PURCHASE)}
                    className={`px-2.5 py-1.5 text-xs rounded-xl font-medium border flex items-center justify-center gap-1 transition-all ${
                      isPurchase
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {SUPPLY_MOVEMENT_LABELS[SupplyMovementType.PURCHASE]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType(SupplyMovementType.CONSUMPTION)}
                    className={`px-2.5 py-1.5 text-xs rounded-xl font-medium border flex items-center justify-center gap-1 transition-all ${
                      isConsumption
                        ? 'bg-spa-rose/15 border-spa-rose text-spa-rose font-semibold'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    {SUPPLY_MOVEMENT_LABELS[SupplyMovementType.CONSUMPTION]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType(SupplyMovementType.WASTE)}
                    className={`px-2.5 py-1.5 text-xs rounded-xl font-medium border flex items-center justify-center gap-1 transition-all ${
                      isWaste
                        ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {SUPPLY_MOVEMENT_LABELS[SupplyMovementType.WASTE]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType(SupplyMovementType.ADJUSTMENT)}
                    className={`px-2.5 py-1.5 text-xs rounded-xl font-medium border flex items-center justify-center gap-1 transition-all ${
                      isAdjustment
                        ? 'bg-primary/15 border-primary text-primary font-semibold'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {SUPPLY_MOVEMENT_LABELS[SupplyMovementType.ADJUSTMENT]}
                  </button>
                </div>
              </div>

              {/* Cantidad y Costo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mov-qty" className="text-xs font-semibold">
                    {isAdjustment ? 'Nuevo Stock Total' : 'Cantidad a Ingresar / Descontar *'}
                  </Label>
                  <Input
                    id="mov-qty"
                    type="number"
                    min="0.01"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mov-cost" className="text-xs font-semibold">
                    Costo Unitario ($ COP)
                  </Label>
                  <Input
                    id="mov-cost"
                    type="number"
                    min="0"
                    step="any"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Factura / Motivo */}
              <div className="space-y-1.5">
                <Label htmlFor="mov-inv" className="text-xs font-semibold">
                  N° Factura / Comprobante (Opcional)
                </Label>
                <Input
                  id="mov-inv"
                  placeholder="Ej. FAC-1204, Recibo #45..."
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mov-reason" className="text-xs font-semibold">
                  Concepto / Observaciones (Opcional)
                </Label>
                <Input
                  id="mov-reason"
                  placeholder="Ej. Compra quincenal para cabina corporal..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Resumen del movimiento */}
              <div className="p-3 bg-muted/50 rounded-xl border border-border/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock actual:</span>
                  <span className="font-semibold">{supply.currentStock} {supply.unitMeasure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nuevo stock resultante:</span>
                  <span className="font-bold text-foreground">{newStockPreview()} {supply.unitMeasure}</span>
                </div>
                {isPurchase && (
                  <div className="flex justify-between pt-1 border-t border-border/60">
                    <span className="text-muted-foreground">Inversión total del movimiento:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ${(quantity * unitCost).toLocaleString('es-CO')} COP
                    </span>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-2 border-t border-border/60 pt-4 pb-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={
                  isPurchase
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-spa-rose hover:bg-spa-rose/90 text-white'
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isPurchase ? 'Registrar Compra' : 'Registrar Movimiento'}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
