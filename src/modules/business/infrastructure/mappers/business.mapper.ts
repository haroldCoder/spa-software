import { Business } from '../../domain/entities/business.entity';
import { BusinessResponseDTO } from '../../application/dtos/business.dto';

export interface SupabaseBusinessRow {
  id: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  email: string;
  password_hash?: string | null;
  role?: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class BusinessMapper {
  public static toDomain(row: SupabaseBusinessRow): Business {
    return Business.create({
      id: row.id,
      name: row.name,
      legalName: row.legal_name,
      taxId: row.tax_id,
      email: row.email,
      passwordHash: row.password_hash ?? null,
      role: row.role ?? 'BUSINESS_OWNER',
      phone: row.phone,
      address: row.address,
      city: row.city,
      country: row.country,
      currency: row.currency,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  public static toPersistence(entity: Business): Partial<SupabaseBusinessRow> {
    const data: Partial<SupabaseBusinessRow> = {
      name: entity.name,
      legal_name: entity.legalName ?? null,
      tax_id: entity.taxId ?? null,
      email: entity.email,
      phone: entity.phone ?? null,
      address: entity.address ?? null,
      city: entity.city ?? null,
      country: entity.country,
      currency: entity.currency,
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

  public static toDTO(entity: Business): BusinessResponseDTO {
    return {
      id: entity.id ?? '',
      name: entity.name,
      legalName: entity.legalName ?? null,
      taxId: entity.taxId ?? null,
      email: entity.email,
      role: entity.role,
      phone: entity.phone ?? null,
      address: entity.address ?? null,
      city: entity.city ?? null,
      country: entity.country,
      currency: entity.currency,
      isActive: entity.isActive,
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: entity.updatedAt ? entity.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}
