import { z } from 'zod';

export const CreateWorkerSchema = z.object({
  businessId: z.string().uuid('businessId debe ser un UUID válido'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Debe ser un correo electrónico válido').optional().nullable(),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  specialty: z.string().optional().nullable(),
  commissionPercentage: z.number().min(0).max(100).default(0),
});

export const UpdateWorkerSchema = CreateWorkerSchema.omit({ businessId: true }).partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateWorkerDTO = z.infer<typeof CreateWorkerSchema>;
export type UpdateWorkerDTO = z.infer<typeof UpdateWorkerSchema>;

export interface WorkerResponseDTO {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  specialty: string | null;
  commissionPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
