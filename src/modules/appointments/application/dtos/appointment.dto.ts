import { z } from 'zod';

export const AppointmentStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const CreateAppointmentSchema = z.object({
  businessId: z.string().uuid({ message: 'El ID del negocio debe ser un UUID válido.' }),
  clientId: z.string().uuid({ message: 'El ID del cliente debe ser un UUID válido.' }),
  workerId: z.string().uuid({ message: 'El ID de la trabajadora debe ser un UUID válido.' }).optional().nullable(),
  serviceId: z.string().uuid({ message: 'El ID del servicio debe ser un UUID válido.' }).optional().nullable(),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La fecha y hora de la cita (scheduledAt) debe ser una fecha ISO válida.',
  }),
  durationMinutes: z.number().int().positive({ message: 'La duración debe ser un número entero mayor a 0.' }).optional(),
  price: z.number().min(0, { message: 'El precio no puede ser negativo.' }).optional(),
  notes: z.string().max(1000, { message: 'Las notas no pueden superar 1000 caracteres.' }).optional().nullable(),
});

export type CreateAppointmentDTO = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentSchema = z.object({
  workerId: z.string().uuid({ message: 'El ID de la trabajadora debe ser un UUID válido.' }).optional().nullable(),
  serviceId: z.string().uuid({ message: 'El ID del servicio debe ser un UUID válido.' }).optional().nullable(),
  scheduledAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'La fecha y hora de la cita (scheduledAt) debe ser una fecha ISO válida.',
    })
    .optional(),
  durationMinutes: z.number().int().positive({ message: 'La duración debe ser un número entero mayor a 0.' }).optional(),
  price: z.number().min(0, { message: 'El precio no puede ser negativo.' }).optional(),
  notes: z.string().max(1000, { message: 'Las notas no pueden superar 1000 caracteres.' }).optional().nullable(),
});

export type UpdateAppointmentDTO = z.infer<typeof UpdateAppointmentSchema>;

export const UpdateAppointmentStatusSchema = z.object({
  status: AppointmentStatusEnum,
  cancellationReason: z.string().max(500, { message: 'El motivo de cancelación no puede exceder 500 caracteres.' }).optional().nullable(),
});

export type UpdateAppointmentStatusDTO = z.infer<typeof UpdateAppointmentStatusSchema>;

export const QueryAppointmentsFilterSchema = z.object({
  status: z.union([AppointmentStatusEnum, z.array(AppointmentStatusEnum)]).optional(),
  workerId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type QueryAppointmentsFilterDTO = z.infer<typeof QueryAppointmentsFilterSchema>;

export interface PaginatedAppointmentsResponseDTO {
  items: AppointmentResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AppointmentClientInfoDTO {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
}

export interface AppointmentWorkerInfoDTO {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string | null;
  phone: string;
}

export interface AppointmentServiceInfoDTO {
  id: string;
  name: string;
  category?: string | null;
  price: number;
  durationMinutes?: number | null;
  imageUrl?: string | null;
}

export interface AppointmentResponseDTO {
  id: string;
  businessId: string;
  workerId: string | null;
  clientId: string;
  serviceId: string | null;
  scheduledAt: string;
  durationMinutes: number;
  endTime: string;
  status: z.infer<typeof AppointmentStatusEnum>;
  price: number;
  notes: string | null;
  cancellationReason: string | null;
  createdById: string | null;
  createdByRole: string | null;
  createdAt: string;
  updatedAt: string;
  client?: AppointmentClientInfoDTO;
  worker?: AppointmentWorkerInfoDTO;
  service?: AppointmentServiceInfoDTO;
}
