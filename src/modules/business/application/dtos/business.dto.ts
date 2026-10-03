import { z } from 'zod';

export const CreateBusinessSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  legalName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  email: z.string().email('Debe ser un correo electrónico válido'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default('CO'),
  currency: z.string().default('COP'),
});

export const UpdateBusinessSchema = CreateBusinessSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateBusinessDTO = z.infer<typeof CreateBusinessSchema>;
export type UpdateBusinessDTO = z.infer<typeof UpdateBusinessSchema>;

export interface BusinessResponseDTO {
  id: string;
  name: string;
  legalName: string | null;
  taxId: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
