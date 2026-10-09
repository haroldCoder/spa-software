import { z } from 'zod';
import { SupplyItemType, SupplyUnitMeasure } from '../../domain/entities/supply.entity';

export const SupplyItemTypeEnum = z.enum([
  'CONSUMABLE',
  'DISPOSABLE',
  'TOOL_UTILITY',
  'CLEANING_HYGIENE',
]);

export const SupplyUnitMeasureEnum = z.enum([
  'UNIT',
  'ML',
  'L',
  'GR',
  'KG',
  'PACK',
  'BOX',
  'ROLL',
]);

export const CreateSupplySchema = z.object({
  businessId: z.string().uuid('El ID del negocio debe ser un UUID válido.'),
  name: z.string().min(1, 'El nombre del insumo o útil es obligatorio.').max(255),
  description: z.string().max(1000).optional().nullable(),
  itemType: SupplyItemTypeEnum.default('CONSUMABLE'),
  category: z.string().max(100).optional().nullable(),
  unitMeasure: SupplyUnitMeasureEnum.default('UNIT'),
  currentStock: z.number().min(0, 'El stock inicial no puede ser negativo.').default(0),
  minStockAlert: z.number().min(0, 'La alerta de stock mínimo no puede ser negativa.').default(5),
  costPerUnit: z.number().min(0, 'El costo unitario no puede ser negativo.').default(0),
  sku: z.string().max(100).optional().nullable(),
  supplierName: z.string().max(255).optional().nullable(),
  supplierContact: z.string().max(255).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreateSupplyDTO = z.infer<typeof CreateSupplySchema>;

export const UpdateSupplySchema = z.object({
  name: z.string().min(1, 'El nombre no puede estar vacío.').max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  itemType: SupplyItemTypeEnum.optional(),
  category: z.string().max(100).optional().nullable(),
  unitMeasure: SupplyUnitMeasureEnum.optional(),
  minStockAlert: z.number().min(0, 'El umbral de alerta no puede ser negativo.').optional(),
  costPerUnit: z.number().min(0, 'El costo unitario no puede ser negativo.').optional(),
  sku: z.string().max(100).optional().nullable(),
  supplierName: z.string().max(255).optional().nullable(),
  supplierContact: z.string().max(255).optional().nullable(),
  isActive: z.boolean().optional(),
});

export type UpdateSupplyDTO = z.infer<typeof UpdateSupplySchema>;

export interface SupplyDTO {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  itemType: SupplyItemType;
  category: string | null;
  unitMeasure: SupplyUnitMeasure;
  currentStock: number;
  minStockAlert: number;
  costPerUnit: number;
  totalStockValue: number;
  isLowStock: boolean;
  sku: string | null;
  supplierName: string | null;
  supplierContact: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
