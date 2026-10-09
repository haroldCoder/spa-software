import { SupabaseClient } from '@supabase/supabase-js';
import {
  ISupplyRepository,
  SupplyFilter,
  SupplySummaryData,
} from '../../domain/repositories/supply.repository.interface';
import { Supply } from '../../domain/entities/supply.entity';
import { SupplyMovementType } from '../../domain/entities/supply-movement.entity';
import { SupplyMapper, SupabaseSupplyRow } from '../mappers/supply.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';
import { PaginatedResult, PaginationHelper } from '@/src/shared/domain/pagination';

export class SupabaseSupplyRepository implements ISupplyRepository {
  private readonly tableName = 'supplies';
  private readonly movementsTable = 'supply_movements';

  constructor(private readonly client: SupabaseClient) {}

  public async findById(id: string): Promise<Supply | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar insumo con id ${id}: ${error.message}`, error);
    }

    if (!data) return null;
    return SupplyMapper.toDomain(data as SupabaseSupplyRow);
  }

  public async findByBusinessId(
    businessId: string,
    filter?: SupplyFilter
  ): Promise<PaginatedResult<Supply>> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('business_id', businessId)
      .order('name', { ascending: true });

    if (filter?.itemType) {
      query = query.eq('item_type', filter.itemType);
    }

    if (filter?.category) {
      query = query.eq('category', filter.category);
    }

    if (filter?.isActive !== undefined) {
      query = query.eq('is_active', filter.isActive);
    }

    if (filter?.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(
        `Error al listar insumos para el negocio ${businessId}: ${error.message}`,
        error
      );
    }

    const rows = (data ?? []) as SupabaseSupplyRow[];
    let items = rows.map((r) => SupplyMapper.toDomain(r));

    if (filter?.lowStockOnly) {
      items = items.filter((s) => s.isLowStock());
    }

    return PaginationHelper.createResult(items, count ?? items.length, page, limit);
  }

  public async findLowStockByBusiness(businessId: string): Promise<Supply[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new DatabaseError(
        `Error al consultar alertas de stock bajo del negocio ${businessId}: ${error.message}`,
        error
      );
    }

    const rows = (data ?? []) as SupabaseSupplyRow[];
    return rows
      .map((r) => SupplyMapper.toDomain(r))
      .filter((supply) => supply.isLowStock());
  }

  public async getSummaryByBusiness(businessId: string): Promise<SupplySummaryData> {
    // 1. Insumos activos del negocio
    const { data: suppliesData, error: suppliesError } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('business_id', businessId);

    if (suppliesError) {
      throw new DatabaseError(
        `Error al obtener resumen de insumos para el negocio ${businessId}: ${suppliesError.message}`,
        suppliesError
      );
    }

    const rows = (suppliesData ?? []) as SupabaseSupplyRow[];
    const domainSupplies = rows.map((r) => SupplyMapper.toDomain(r));

    const totalSuppliesCount = domainSupplies.length;
    const activeSupplies = domainSupplies.filter((s) => s.isActive);
    const activeSuppliesCount = activeSupplies.length;
    const lowStockCount = activeSupplies.filter((s) => s.isLowStock()).length;

    const totalInventoryCost = activeSupplies.reduce((acc, s) => acc + s.totalStockValue, 0);

    // 2. Gastos del mes actual en compras y consumos
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: movementsData, error: movementsError } = await this.client
      .from(this.movementsTable)
      .select('movement_type, total_cost')
      .eq('business_id', businessId)
      .gte('created_at', firstDayOfMonth);

    if (movementsError) {
      throw new DatabaseError(
        `Error al obtener resumen de movimientos mensuales: ${movementsError.message}`,
        movementsError
      );
    }

    let monthlyPurchasesCost = 0;
    let monthlyConsumptionsCost = 0;

    for (const mov of movementsData ?? []) {
      const cost = Number(mov.total_cost) || 0;
      if (mov.movement_type === SupplyMovementType.PURCHASE) {
        monthlyPurchasesCost += cost;
      } else if (mov.movement_type === SupplyMovementType.CONSUMPTION) {
        monthlyConsumptionsCost += cost;
      }
    }

    return {
      totalSuppliesCount,
      activeSuppliesCount,
      lowStockCount,
      totalInventoryCost: Number(totalInventoryCost.toFixed(2)),
      monthlyPurchasesCost: Number(monthlyPurchasesCost.toFixed(2)),
      monthlyConsumptionsCost: Number(monthlyConsumptionsCost.toFixed(2)),
    };
  }

  public async save(supply: Supply): Promise<Supply> {
    const row = SupplyMapper.toPersistence(supply);
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(row)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al guardar insumo o útil: ${error.message}`, error);
    }

    return SupplyMapper.toDomain(data as SupabaseSupplyRow);
  }

  public async update(supply: Supply): Promise<Supply> {
    if (!supply.id) {
      throw new DatabaseError('No se puede actualizar un insumo sin identificador ID.');
    }

    const row = SupplyMapper.toPersistence(supply);
    const { data, error } = await this.client
      .from(this.tableName)
      .update(row)
      .eq('id', supply.id)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al actualizar el insumo ${supply.id}: ${error.message}`, error);
    }

    return SupplyMapper.toDomain(data as SupabaseSupplyRow);
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new DatabaseError(`Error al eliminar insumo con id ${id}: ${error.message}`, error);
    }
  }
}
