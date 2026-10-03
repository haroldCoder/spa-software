import { CatalogItem, CatalogItemType } from '../../domain/entities/catalog-item.entity';
import { CatalogItemResponseDTO } from '../../application/dtos/catalog-item.dto';

export interface SupabaseCatalogItemRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  item_type: 'SERVICE' | 'PRODUCT';
  category: string | null;
  price: number | string;
  cost: number | string;
  duration_minutes: number | null;
  stock_quantity: number | null;
  sku: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class CatalogItemMapper {
  public static toDomain(row: SupabaseCatalogItemRow): CatalogItem {
    return CatalogItem.create({
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      description: row.description,
      itemType: row.item_type as CatalogItemType,
      category: row.category,
      price: Number(row.price || 0),
      cost: Number(row.cost || 0),
      durationMinutes: row.duration_minutes !== null ? Number(row.duration_minutes) : null,
      stockQuantity: row.stock_quantity !== null ? Number(row.stock_quantity) : null,
      sku: row.sku,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  public static toPersistence(entity: CatalogItem): Partial<SupabaseCatalogItemRow> {
    const data: Partial<SupabaseCatalogItemRow> = {
      business_id: entity.businessId,
      name: entity.name,
      description: entity.description ?? null,
      item_type: entity.itemType,
      category: entity.category ?? null,
      price: entity.price,
      cost: entity.cost,
      duration_minutes: entity.durationMinutes ?? null,
      stock_quantity: entity.stockQuantity ?? null,
      sku: entity.sku ?? null,
      is_active: entity.isActive,
    };
    if (entity.id) {
      data.id = entity.id;
    }
    return data;
  }

  public static toDTO(entity: CatalogItem): CatalogItemResponseDTO {
    return {
      id: entity.id ?? '',
      businessId: entity.businessId,
      name: entity.name,
      description: entity.description ?? null,
      itemType: entity.itemType,
      category: entity.category ?? null,
      price: entity.price,
      cost: entity.cost,
      durationMinutes: entity.durationMinutes ?? null,
      stockQuantity: entity.stockQuantity ?? null,
      sku: entity.sku ?? null,
      isActive: entity.isActive,
      createdAt: entity.createdAt ? entity.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: entity.updatedAt ? entity.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}
