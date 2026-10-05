import { z } from 'zod';

export const CreateClientSchema = z.object({
  businessId: z.string().uuid('businessId debe ser un UUID válido'),
  primaryWorkerId: z
    .preprocess((val) => (val === '' || val === undefined ? null : val), z.string().uuid('primaryWorkerId debe ser un UUID válido').nullable().optional()),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z
    .preprocess((val) => (val === '' || val === undefined ? null : val), z.string().email('Debe ser un correo electrónico válido').nullable().optional()),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  identificationNumber: z
    .preprocess((val) => (val === '' || val === undefined ? null : val), z.string().nullable().optional()),
  birthDate: z
    .preprocess((val) => (val === '' || val === undefined ? null : val), z.string().nullable().optional()), // YYYY-MM-DD
  notes: z
    .preprocess((val) => (val === '' || val === undefined ? null : val), z.string().nullable().optional()),
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
