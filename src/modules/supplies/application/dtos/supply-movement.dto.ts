import { z } from 'zod';
import { SupplyMovementType } from '../../domain/entities/supply-movement.entity';

export const SupplyMovementTypeEnum = z.enum([
  'PURCHASE',
  'CONSUMPTION',
  'WASTE',
  'ADJUSTMENT',
]);

export const RegisterSupplyMovementSchema = z.object({
  businessId: z.string().uuid('El ID del negocio debe ser un UUID válido.'),
  supplyId: z.string().uuid('El ID del insumo debe ser un UUID válido.'),
  movementType: SupplyMovementTypeEnum,
  quantity: z.number().positive('La cantidad debe ser mayor que cero.'),
  unitCost: z.number().min(0, 'El costo unitario no puede ser negativo.').default(0),
  reason: z.string().max(500).optional().nullable(),
  invoiceNumber: z.string().max(100).optional().nullable(),
  workerId: z.string().uuid('El ID de la trabajadora debe ser un UUID válido.').optional().nullable(),
});

export type RegisterSupplyMovementDTO = z.infer<typeof RegisterSupplyMovementSchema>;

export interface SupplyMovementDTO {
  id: string;
  businessId: string;
  supplyId: string;
  supplyName?: string;
  movementType: SupplyMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalCost: number;
  reason: string | null;
  invoiceNumber: string | null;
  workerId: string | null;
  workerName?: string | null;
  createdById: string;
  createdByRole: string;
  createdAt: string;
}
