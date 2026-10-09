'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import {
  CreateSupplyPayload,
  SupplyItemType,
  SupplyUnitMeasure,
} from '../../domain/supplies.types';
import { X, Plus, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { SUPPLY_TYPE_LABELS, SUPPLY_UNIT_LABELS } from '../../domain/constants';

interface CreateSupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSupplyPayload) => Promise<void>;
  businessId: string;
}

export function CreateSupplyModal({
  isOpen,
  onClose,
  onSubmit,
  businessId,
}: CreateSupplyModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<SupplyItemType>(SupplyItemType.CONSUMABLE);
  const [category, setCategory] = useState('');
  const [unitMeasure, setUnitMeasure] = useState<SupplyUnitMeasure>(SupplyUnitMeasure.UNIT);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [costPerUnit, setCostPerUnit] = useState<number>(0);
  const [sku, setSku] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del insumo o útil es obligatorio.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        businessId,
        name: name.trim(),
        description: description.trim() || null,
        itemType,
        category: category.trim() || null,
        unitMeasure,
        currentStock: Math.max(0, Number(currentStock) || 0),
        minStockAlert: Math.max(0, Number(minStockAlert) || 0),
        costPerUnit: Math.max(0, Number(costPerUnit) || 0),
        sku: sku.trim() || null,
        supplierName: supplierName.trim() || null,
        supplierContact: supplierContact.trim() || null,
      });

      // Reset
      setName('');
      setDescription('');
      setItemType(SupplyItemType.CONSUMABLE);
      setCategory('');
      setUnitMeasure(SupplyUnitMeasure.UNIT);
      setCurrentStock(0);
      setMinStockAlert(5);
      setCostPerUnit(0);
      setSku('');
      setSupplierName('');
      setSupplierContact('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el insumo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl my-8">
        <Card className="border-border/80 shadow-2xl bg-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-spa-rose" />
                Nuevo Insumo o Útil para el Spa
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Registra un consumible de cabina, herramienta de trabajo o material de aseo para control de inventario y costos.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Nombre y SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="supply-name" className="text-xs font-semibold">
                    Nombre del Insumo / Útil *
                  </Label>
                  <Input
                    id="supply-name"
                    placeholder="Ej. Aceite de Almendras 1L, Cera Depilatoria..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="supply-sku" className="text-xs font-semibold">
                    Código / SKU (Opcional)
                  </Label>
                  <Input
                    id="supply-sku"
                    placeholder="Ej. INS-ACE-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              {/* Tipo y Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="supply-type" className="text-xs font-semibold">
                    Tipo de Insumo *
                  </Label>
                  <select
                    id="supply-type"
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as SupplyItemType)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-spa-rose/30"
                  >
                    {(Object.keys(SUPPLY_TYPE_LABELS) as SupplyItemType[]).map((key) => (
                      <option key={key} value={key}>
                        {SUPPLY_TYPE_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="supply-category" className="text-xs font-semibold">
                    Categoría / Área
                  </Label>
                  <Input
                    id="supply-category"
                    placeholder="Ej. Facial, Corporal, Uñas, Capilar, Aseo..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              {/* Unidad de Medida, Stock Inicial, Alerta Mínima */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="supply-unit" className="text-xs font-semibold">
                    Unidad de Medida
                  </Label>
                  <select
                    id="supply-unit"
                    value={unitMeasure}
                    onChange={(e) => setUnitMeasure(e.target.value as SupplyUnitMeasure)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-spa-rose/30"
                  >
                    {(Object.keys(SUPPLY_UNIT_LABELS) as SupplyUnitMeasure[]).map((key) => (
                      <option key={key} value={key}>
                        {SUPPLY_UNIT_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="supply-stock" className="text-xs font-semibold">
                    Stock Inicial
                  </Label>
                  <Input
                    id="supply-stock"
                    type="number"
                    min="0"
                    step="any"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="supply-min-alert" className="text-xs font-semibold">
                    Alerta de Stock Mínimo
                  </Label>
                  <Input
                    id="supply-min-alert"
                    type="number"
                    min="0"
                    step="any"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Costo Unitario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="supply-cost" className="text-xs font-semibold">
                    Costo Unitario ($ COP)
                  </Label>
                  <Input
                    id="supply-cost"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Valor total inicial: ${(currentStock * costPerUnit).toLocaleString('es-CO')} COP
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="supply-provider" className="text-xs font-semibold">
                    Proveedor Habitual (Opcional)
                  </Label>
                  <Input
                    id="supply-provider"
                    placeholder="Ej. Distribuidora Belleza SAS"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                </div>
              </div>

              {/* Teléfono Proveedor y Descripción */}
              <div className="space-y-1.5">
                <Label htmlFor="supply-contact" className="text-xs font-semibold">
                  Contacto del Proveedor (Opcional)
                </Label>
                <Input
                  id="supply-contact"
                  placeholder="Ej. +57 300 123 4567 o vendedor"
                  value={supplierContact}
                  onChange={(e) => setSupplierContact(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="supply-desc" className="text-xs font-semibold">
                  Descripción o Notas de Uso (Opcional)
                </Label>
                <Textarea
                  id="supply-desc"
                  placeholder="Instrucciones, concentración o especificaciones de uso en cabina..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-2 border-t border-border/60 pt-4 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-spa-rose hover:bg-spa-rose/90 text-white font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Insumo
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
