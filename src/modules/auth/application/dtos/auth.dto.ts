import { z } from 'zod';
import { AuthRole, UserType } from '../../domain/entities/auth-user.entity';

export const RegisterBusinessSchema = z.object({
  name: z.string().min(2, 'El nombre del negocio debe tener al menos 2 caracteres'),
  legalName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default('CO'),
  currency: z.string().default('COP'),
});

export const LoginBusinessSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const LoginWorkerSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const LoginUnifiedSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  userType: z.enum(['BUSINESS', 'WORKER']).optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'El refresh token es requerido'),
});

export const RegisterWorkerSchema = z.object({
  businessId: z.string().uuid('businessId debe ser un UUID válido'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  specialty: z.string().optional().nullable(),
  commissionPercentage: z.number().min(0).max(100).default(0),
});

export type RegisterBusinessInputDTO = z.infer<typeof RegisterBusinessSchema>;
export type RegisterWorkerInputDTO = z.infer<typeof RegisterWorkerSchema>;
export type LoginBusinessInputDTO = z.infer<typeof LoginBusinessSchema>;
export type LoginWorkerInputDTO = z.infer<typeof LoginWorkerSchema>;
export type LoginUnifiedInputDTO = z.infer<typeof LoginUnifiedSchema>;
export type RefreshTokenInputDTO = z.infer<typeof RefreshTokenSchema>;

export interface AuthenticatedUserDTO {
  id: string;
  businessId: string;
  email: string;
  name: string;
  role: AuthRole;
  userType: UserType;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
}

export interface AuthResponseDTO {
  user: AuthenticatedUserDTO;
  tokens: AuthTokensDTO;
  session: {
    id: string;
    expiresAt: string;
  };
}
