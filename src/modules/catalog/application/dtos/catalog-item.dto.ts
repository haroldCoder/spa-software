import { z } from 'zod';

export const CatalogItemTypeSchema = z.enum(['SERVICE', 'PRODUCT']);

export const CreateCatalogItemSchema = z.object({
  businessId: z.string().uuid('businessId debe ser un UUID válido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional().nullable(),
  itemType: CatalogItemTypeSchema,
  category: z.string().optional().nullable(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  cost: z.number().min(0, 'El costo no puede ser negativo').default(0),
  durationMinutes: z.number().int().positive('La duración debe ser mayor a 0 minutos').optional().nullable(),
  stockQuantity: z.number().int().min(0, 'El stock no puede ser negativo').optional().nullable(),
  sku: z.string().optional().nullable(),
  imageUrl: z
    .preprocess((val) => (val === '' || val === undefined ? null : val), z.string().nullable().optional()),
});

export const UpdateCatalogItemSchema = CreateCatalogItemSchema.omit({ businessId: true }).partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateCatalogItemDTO = z.infer<typeof CreateCatalogItemSchema>;
export type UpdateCatalogItemDTO = z.infer<typeof UpdateCatalogItemSchema>;

export interface CatalogItemResponseDTO {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  itemType: 'SERVICE' | 'PRODUCT';
  category: string | null;
  price: number;
  cost: number;
  durationMinutes: number | null;
  stockQuantity: number | null;
  sku: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
