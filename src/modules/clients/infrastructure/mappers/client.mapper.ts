import { Client } from '../../domain/entities/client.entity';
import { ClientResponseDTO } from '../../application/dtos/client.dto';

export interface SupabaseClientRow {
  id: string;
  business_id: string;
  primary_worker_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  identification_number: string | null;
  birth_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class ClientMapper {
  public static toDomain(row: SupabaseClientRow): Client {
    return Client.create({
      id: row.id,
      businessId: row.business_id,
      primaryWorkerId: row.primary_worker_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      identificationNumber: row.identification_number,
      birthDate: row.birth_date,
      notes: row.notes,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  public static toPersistence(entity: Client): Partial<SupabaseClientRow> {
    const data: Partial<SupabaseClientRow> = {
      business_id: entity.businessId,
      primary_worker_id: entity.primaryWorkerId ?? null,
      first_name: entity.firstName,
      last_name: entity.lastName,
      email: entity.email ?? null,
      phone: entity.phone,
      identification_number: entity.identificationNumber ?? null,
      birth_date: entity.birthDate ?? null,
      notes: entity.notes ?? null,
      is_active: entity.isActive,
    };
    if (entity.id) {
      data.id = entity.id;
    }
    return data;
  }

  public static toDTO(entity: Client): ClientResponseDTO {
    return {
      id: entity.id ?? '',
      businessId: entity.businessId,
      primaryWorkerId: entity.primaryWorkerId ?? null,
      firstName: entity.firstName,
      lastName: entity.lastName,
      fullName: entity.fullName,
      email: entity.email ?? null,
      phone: entity.phone,
      identificationNumber: entity.identificationNumber ?? null,
      birthDate: entity.birthDate ?? null,
      notes: entity.notes ?? null,
      isActive: entity.isActive,
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: entity.updatedAt ? entity.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}
