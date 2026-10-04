import { Worker } from '../../domain/entities/worker.entity';
import { WorkerResponseDTO } from '../../application/dtos/worker.dto';

export interface SupabaseWorkerRow {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  password_hash?: string | null;
  role?: string;
  phone: string;
  specialty: string | null;
  commission_percentage: number | string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class WorkerMapper {
  public static toDomain(row: SupabaseWorkerRow): Worker {
    return Worker.create({
      id: row.id,
      businessId: row.business_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      passwordHash: row.password_hash ?? null,
      role: row.role ?? 'WORKER',
      phone: row.phone,
      specialty: row.specialty,
      commissionPercentage: Number(row.commission_percentage || 0),
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  public static toPersistence(entity: Worker): Partial<SupabaseWorkerRow> {
    const data: Partial<SupabaseWorkerRow> = {
      business_id: entity.businessId,
      first_name: entity.firstName,
      last_name: entity.lastName,
      email: entity.email ?? null,
      phone: entity.phone,
      specialty: entity.specialty ?? null,
      commission_percentage: entity.commissionPercentage,
      is_active: entity.isActive,
    };
    if (entity.passwordHash !== undefined) {
      data.password_hash = entity.passwordHash;
    }
    if (entity.role !== undefined) {
      data.role = entity.role;
    }
    if (entity.id) {
      data.id = entity.id;
    }
    return data;
  }

  public static toDTO(entity: Worker): WorkerResponseDTO {
    return {
      id: entity.id ?? '',
      businessId: entity.businessId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      fullName: entity.fullName,
      email: entity.email ?? null,
      role: entity.role,
      phone: entity.phone,
      specialty: entity.specialty ?? null,
      commissionPercentage: entity.commissionPercentage,
      isActive: entity.isActive,
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: entity.updatedAt ? entity.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}
