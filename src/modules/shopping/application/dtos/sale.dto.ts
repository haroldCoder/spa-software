import { z } from 'zod';
import { SaleItemType } from '../../domain/entities/sale-item.entity';

export const CreateSaleItemSchema = z.object({
  catalogItemId: z.string().uuid('ID del catálogo debe ser un UUID válido').optional().nullable(),
  itemType: z.nativeEnum(SaleItemType, {
    message: "El tipo de ítem debe ser 'SERVICE' o 'PRODUCT'",
  }),
  itemName: z.string().min(1, 'El nombre del producto o servicio es obligatorio'),
  quantity: z.number().int().min(1, 'La cantidad debe ser mínimo 1').default(1),
  unitPrice: z.number().min(0, 'El precio unitario no puede ser negativo'),
});

export const CreateSaleSchema = z
  .object({
    businessId: z.string().uuid('ID del negocio debe ser un UUID válido'),
    clientId: z.string().uuid('ID del cliente debe ser un UUID válido'),
    workerId: z.string().uuid('ID de la trabajadora debe ser un UUID válido').optional().nullable(),
    // Array de items o atajo de ítem individual
    items: z.array(CreateSaleItemSchema).optional(),
    // Atajo para registrar venta de 1 solo producto o servicio directamente:
    catalogItemId: z.string().uuid().optional().nullable(),
    itemType: z.nativeEnum(SaleItemType).optional(),
    itemName: z.string().optional(),
    quantity: z.number().int().min(1).optional(),
    unitPrice: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      const hasItemsArray = data.items && data.items.length > 0;
      const hasSingleItem = Boolean(data.itemName && data.unitPrice !== undefined && data.itemType);
      return hasItemsArray || hasSingleItem;
    },
    {
      message: 'Debe proporcionar al menos un producto o servicio para registrar la venta.',
    }
  );

export type CreateSaleItemDTO = z.infer<typeof CreateSaleItemSchema>;
export type CreateSaleDTO = z.infer<typeof CreateSaleSchema>;

export interface SaleItemResponseDTO {
  id: string;
  catalogItemId?: string | null;
  itemType: SaleItemType;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleResponseDTO {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | null;
  } | null;
  workerId?: string | null;
  workerName?: string | null;
  worker?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string | null;
    phone?: string | null;
  } | null;
  totalAmount: number;
  serviceValue: number;
  serviceAmount: number;
  productAmount: number;
  itemType: 'SERVICE' | 'PRODUCT' | 'MIXED';
  itemsSummary: string;
  items: SaleItemResponseDTO[];
  createdAt: string;
  updatedAt: string;
}
