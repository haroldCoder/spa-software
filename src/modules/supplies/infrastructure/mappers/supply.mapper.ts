import { Supply, SupplyItemType, SupplyUnitMeasure } from '../../domain/entities/supply.entity';
import { SupplyDTO } from '../../application/dtos/supply.dto';

export interface SupabaseSupplyRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  item_type: SupplyItemType;
  category: string | null;
  unit_measure: SupplyUnitMeasure;
  current_stock: number | string;
  min_stock_alert: number | string;
  cost_per_unit: number | string;
  sku: string | null;
  supplier_name: string | null;
  supplier_contact: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class SupplyMapper {
  public static toDomain(row: SupabaseSupplyRow): Supply {
    return Supply.create({
      id: row.id,
      businessId: row.business_id,
      name: row.name,
      description: row.description,
      itemType: row.item_type,
      category: row.category,
      unitMeasure: row.unit_measure,
      currentStock: Number(row.current_stock),
      minStockAlert: Number(row.min_stock_alert),
      costPerUnit: Number(row.cost_per_unit),
      sku: row.sku,
      supplierName: row.supplier_name,
      supplierContact: row.supplier_contact,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  public static toPersistence(supply: Supply): Record<string, unknown> {
    const data: Record<string, unknown> = {
      business_id: supply.businessId,
      name: supply.name,
      description: supply.description ?? null,
      item_type: supply.itemType,
      category: supply.category ?? null,
      unit_measure: supply.unitMeasure,
      current_stock: supply.currentStock,
      min_stock_alert: supply.minStockAlert,
      cost_per_unit: supply.costPerUnit,
      sku: supply.sku ?? null,
      supplier_name: supply.supplierName ?? null,
      supplier_contact: supply.supplierContact ?? null,
      is_active: supply.isActive,
    };

    if (supply.id) {
      data.id = supply.id;
    }

    return data;
  }

  public static toDTO(supply: Supply): SupplyDTO {
    return {
      id: supply.id!,
      businessId: supply.businessId,
      name: supply.name,
      description: supply.description ?? null,
      itemType: supply.itemType,
      category: supply.category ?? null,
      unitMeasure: supply.unitMeasure,
      currentStock: supply.currentStock,
      minStockAlert: supply.minStockAlert,
      costPerUnit: supply.costPerUnit,
      totalStockValue: Number(supply.totalStockValue.toFixed(2)),
      isLowStock: supply.isLowStock(),
      sku: supply.sku ?? null,
      supplierName: supply.supplierName ?? null,
      supplierContact: supply.supplierContact ?? null,
      isActive: supply.isActive,
      createdAt: supply.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: supply.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  public static rowToDTO(row: SupabaseSupplyRow): SupplyDTO {
    const domain = this.toDomain(row);
    return this.toDTO(domain);
  }
}
