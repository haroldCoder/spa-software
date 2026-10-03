import { z } from 'zod';

export const CreateClientSchema = z.object({
  businessId: z.string().uuid('businessId debe ser un UUID válido'),
  primaryWorkerId: z.string().uuid('primaryWorkerId debe ser un UUID válido').optional().nullable(),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Debe ser un correo electrónico válido').optional().nullable(),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  identificationNumber: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(), // YYYY-MM-DD
  notes: z.string().optional().nullable(),
});

export const UpdateClientSchema = CreateClientSchema.omit({ businessId: true }).partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateClientDTO = z.infer<typeof CreateClientSchema>;
export type UpdateClientDTO = z.infer<typeof UpdateClientSchema>;

export interface ClientResponseDTO {
  id: string;
  businessId: string;
  primaryWorkerId: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  identificationNumber: string | null;
  birthDate: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
