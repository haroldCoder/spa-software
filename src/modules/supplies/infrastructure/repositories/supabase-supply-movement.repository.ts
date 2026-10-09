import { SupabaseClient } from '@supabase/supabase-js';
import {
  ISupplyMovementRepository,
  SupplyMovementFilter,
} from '../../domain/repositories/supply-movement.repository.interface';
import { SupplyMovement } from '../../domain/entities/supply-movement.entity';
import {
  SupplyMovementMapper,
  SupabaseSupplyMovementRow,
} from '../mappers/supply-movement.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';
import { PaginatedResult, PaginationHelper } from '@/src/shared/domain/pagination';

export class SupabaseSupplyMovementRepository implements ISupplyMovementRepository {
  private readonly tableName = 'supply_movements';
  private readonly selectFields = '*, supplies(name), workers(first_name, last_name)';

  constructor(private readonly client: SupabaseClient) {}

  public async save(movement: SupplyMovement): Promise<SupplyMovement> {
    const row = SupplyMovementMapper.toPersistence(movement);
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(row)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al registrar movimiento de insumo: ${error.message}`, error);
    }

    return SupplyMovementMapper.toDomain(data as SupabaseSupplyMovementRow);
  }

  public async findBySupplyId(
    supplyId: string,
    filter?: SupplyMovementFilter
  ): Promise<PaginatedResult<SupplyMovement>> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.tableName)
      .select(this.selectFields, { count: 'exact' })
      .eq('supply_id', supplyId)
      .order('created_at', { ascending: false });

    if (filter?.movementType) {
      query = query.eq('movement_type', filter.movementType);
    }

    if (filter?.workerId) {
      query = query.eq('worker_id', filter.workerId);
    }

    if (filter?.startDate) {
      query = query.gte('created_at', filter.startDate.toISOString());
    }

    if (filter?.endDate) {
      query = query.lte('created_at', filter.endDate.toISOString());
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(
        `Error al consultar movimientos del insumo ${supplyId}: ${error.message}`,
        error
      );
    }

    const rows = (data ?? []) as unknown as SupabaseSupplyMovementRow[];
    const items = rows.map((r) => SupplyMovementMapper.toDomain(r));

    return PaginationHelper.createResult(items, count ?? items.length, page, limit);
  }

  public async findByBusinessId(
    businessId: string,
    filter?: SupplyMovementFilter
  ): Promise<PaginatedResult<SupplyMovement>> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.tableName)
      .select(this.selectFields, { count: 'exact' })
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (filter?.supplyId) {
      query = query.eq('supply_id', filter.supplyId);
    }

    if (filter?.movementType) {
      query = query.eq('movement_type', filter.movementType);
    }

    if (filter?.workerId) {
      query = query.eq('worker_id', filter.workerId);
    }

    if (filter?.startDate) {
      query = query.gte('created_at', filter.startDate.toISOString());
    }

    if (filter?.endDate) {
      query = query.lte('created_at', filter.endDate.toISOString());
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(
        `Error al consultar movimientos para el negocio ${businessId}: ${error.message}`,
        error
      );
    }

    const rows = (data ?? []) as unknown as SupabaseSupplyMovementRow[];
    const items = rows.map((r) => SupplyMovementMapper.toDomain(r));

    return PaginationHelper.createResult(items, count ?? items.length, page, limit);
  }

  public async findRowsByBusinessId(
    businessId: string,
    filter?: SupplyMovementFilter
  ): Promise<PaginatedResult<SupabaseSupplyMovementRow>> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.tableName)
      .select(this.selectFields, { count: 'exact' })
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (filter?.supplyId) {
      query = query.eq('supply_id', filter.supplyId);
    }

    if (filter?.movementType) {
      query = query.eq('movement_type', filter.movementType);
    }

    if (filter?.workerId) {
      query = query.eq('worker_id', filter.workerId);
    }

    if (filter?.startDate) {
      query = query.gte('created_at', filter.startDate.toISOString());
    }

    if (filter?.endDate) {
      query = query.lte('created_at', filter.endDate.toISOString());
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(
        `Error al consultar filas de movimientos: ${error.message}`,
        error
      );
    }

    const rows = (data ?? []) as unknown as SupabaseSupplyMovementRow[];
    return PaginationHelper.createResult(rows, count ?? rows.length, page, limit);
  }
}
