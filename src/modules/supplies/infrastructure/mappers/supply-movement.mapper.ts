import { SupplyMovement, SupplyMovementType } from '../../domain/entities/supply-movement.entity';
import { SupplyMovementDTO } from '../../application/dtos/supply-movement.dto';

export interface SupabaseSupplyMovementRow {
  id: string;
  business_id: string;
  supply_id: string;
  movement_type: SupplyMovementType;
  quantity: number | string;
  previous_stock: number | string;
  new_stock: number | string;
  unit_cost: number | string;
  total_cost: number | string;
  reason: string | null;
  invoice_number: string | null;
  worker_id: string | null;
  created_by_id: string;
  created_by_role: string;
  created_at: string;
  supplies?: { name: string } | null;
  workers?: { first_name: string; last_name: string } | null;
}

export class SupplyMovementMapper {
  public static toDomain(row: SupabaseSupplyMovementRow): SupplyMovement {
    return SupplyMovement.create({
      id: row.id,
      businessId: row.business_id,
      supplyId: row.supply_id,
      movementType: row.movement_type,
      quantity: Number(row.quantity),
      previousStock: Number(row.previous_stock),
      newStock: Number(row.new_stock),
      unitCost: Number(row.unit_cost),
      totalCost: Number(row.total_cost),
      reason: row.reason,
      invoiceNumber: row.invoice_number,
      workerId: row.worker_id,
      createdById: row.created_by_id,
      createdByRole: row.created_by_role,
      createdAt: new Date(row.created_at),
    });
  }

  public static toPersistence(movement: SupplyMovement): Record<string, unknown> {
    const data: Record<string, unknown> = {
      business_id: movement.businessId,
      supply_id: movement.supplyId,
      movement_type: movement.movementType,
      quantity: movement.quantity,
      previous_stock: movement.previousStock,
      new_stock: movement.newStock,
      unit_cost: movement.unitCost,
      total_cost: movement.totalCost,
      reason: movement.reason ?? null,
      invoice_number: movement.invoiceNumber ?? null,
      worker_id: movement.workerId ?? null,
      created_by_id: movement.createdById,
      created_by_role: movement.createdByRole,
    };

    if (movement.id) {
      data.id = movement.id;
    }

    return data;
  }

  public static toDTO(
    movement: SupplyMovement,
    extra?: { supplyName?: string; workerName?: string }
  ): SupplyMovementDTO {
    return {
      id: movement.id!,
      businessId: movement.businessId,
      supplyId: movement.supplyId,
      supplyName: extra?.supplyName,
      movementType: movement.movementType,
      quantity: movement.quantity,
      previousStock: movement.previousStock,
      newStock: movement.newStock,
      unitCost: movement.unitCost,
      totalCost: movement.totalCost,
      reason: movement.reason ?? null,
      invoiceNumber: movement.invoiceNumber ?? null,
      workerId: movement.workerId ?? null,
      workerName: extra?.workerName,
      createdById: movement.createdById,
      createdByRole: movement.createdByRole,
      createdAt: movement.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  public static rowToDTO(row: SupabaseSupplyMovementRow): SupplyMovementDTO {
    const domain = this.toDomain(row);
    const workerName = row.workers
      ? `${row.workers.first_name} ${row.workers.last_name}`.trim()
      : undefined;
    const supplyName = row.supplies?.name;

    return this.toDTO(domain, { supplyName, workerName });
  }
}
