import { SupabaseClient } from '@supabase/supabase-js';
import {
  ISaleRepository,
  SaleFilter,
  PaginatedSales,
} from '../../domain/repositories/sale.repository.interface';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleMapper, SupabaseSaleRow, SupabaseSaleItemRow } from '../mappers/sale.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';
import { PaginatedResult, PaginationHelper } from '@/src/shared/domain/pagination';

export class SupabaseSaleRepository implements ISaleRepository {
  private readonly salesTable = 'sales';
  private readonly itemsTable = 'sale_items';
  private readonly selectFields = `
    *,
    clients (id, first_name, last_name, phone, email),
    workers (id, first_name, last_name, specialty, phone),
    sale_items (*)
  `;

  constructor(private readonly client: SupabaseClient) {}

  public async findById(id: string): Promise<Sale | null> {
    const row = await this.findByIdWithRelations(id);
    if (!row) return null;
    return SaleMapper.toDomain(row);
  }

  public async findByIdWithRelations(id: string): Promise<SupabaseSaleRow | null> {
    const { data, error } = await this.client
      .from(this.salesTable)
      .select(this.selectFields)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar la venta con id ${id}: ${error.message}`, error);
    }

    if (!data) return null;
    return data as unknown as SupabaseSaleRow;
  }

  public async findByBusinessId(
    businessId: string,
    filter?: SaleFilter
  ): Promise<PaginatedSales> {
    const paginated = await this.findByBusinessIdWithRelations(businessId, filter);
    const domainItems = paginated.items.map(SaleMapper.toDomain);
    return PaginationHelper.createResult(domainItems, paginated.total, paginated.page, paginated.limit);
  }

  public async findByBusinessIdWithRelations(
    businessId: string,
    filter?: SaleFilter
  ): Promise<PaginatedResult<SupabaseSaleRow>> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.salesTable)
      .select(this.selectFields, { count: 'exact' })
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    query = this.applyFilters(query, filter);
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(
        `Error al consultar ventas del negocio ${businessId}: ${error.message}`,
        error
      );
    }

    const total = count ?? 0;
    const rows = (data as unknown as SupabaseSaleRow[]) || [];
    return PaginationHelper.createResult(rows, total, page, limit);
  }

  public async findByClientId(
    clientId: string,
    filter?: SaleFilter
  ): Promise<PaginatedSales> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.salesTable)
      .select(this.selectFields, { count: 'exact' })
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    query = this.applyFilters(query, filter);
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(
        `Error al consultar ventas del cliente ${clientId}: ${error.message}`,
        error
      );
    }

    const total = count ?? 0;
    const items = (data as unknown as SupabaseSaleRow[]).map(SaleMapper.toDomain);
    return PaginationHelper.createResult(items, total, page, limit);
  }

  public async findByWorkerId(
    workerId: string,
    filter?: SaleFilter
  ): Promise<PaginatedSales> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.salesTable)
      .select(this.selectFields, { count: 'exact' })
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });

    query = this.applyFilters(query, filter);
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(
        `Error al consultar ventas de la trabajadora ${workerId}: ${error.message}`,
        error
      );
    }

    const total = count ?? 0;
    const items = (data as unknown as SupabaseSaleRow[]).map(SaleMapper.toDomain);
    return PaginationHelper.createResult(items, total, page, limit);
  }

  public async save(sale: Sale): Promise<Sale> {
    const { saleRow, itemRows } = SaleMapper.toPersistence(sale);

    // 1. Insertar la venta principal
    const { data: savedSaleData, error: saleError } = await this.client
      .from(this.salesTable)
      .insert(saleRow)
      .select()
      .single();

    if (saleError || !savedSaleData) {
      throw new DatabaseError(
        `Error al registrar venta en base de datos: ${saleError?.message}`,
        saleError
      );
    }

    const saleId = savedSaleData.id;

    // 2. Insertar los ítems de la venta si existen
    if (itemRows.length > 0) {
      const itemsToInsert = itemRows.map((it) => ({
        ...it,
        sale_id: saleId,
      }));

      const { error: itemsError } = await this.client
        .from(this.itemsTable)
        .insert(itemsToInsert);

      if (itemsError) {
        throw new DatabaseError(
          `Error al guardar los ítems de la venta: ${itemsError.message}`,
          itemsError
        );
      }
    }

    // 3. Devolver la entidad completa con relaciones
    const complete = await this.findById(saleId);
    if (!complete) {
      throw new DatabaseError(`No se pudo recuperar la venta guardada con ID ${saleId}`);
    }

    return complete;
  }

  private applyFilters(query: any, filter?: SaleFilter): any {
    if (!filter) return query;

    if (filter.clientId) {
      query = query.eq('client_id', filter.clientId);
    }
    if (filter.workerId) {
      query = query.eq('worker_id', filter.workerId);
    }
    if (filter.startDate) {
      query = query.gte('created_at', filter.startDate.toISOString());
    }
    if (filter.endDate) {
      query = query.lte('created_at', filter.endDate.toISOString());
    }
    if (filter.itemType === 'SERVICE') {
      query = query.gt('service_amount', 0);
    } else if (filter.itemType === 'PRODUCT') {
      query = query.gt('product_amount', 0);
    }

    return query;
  }
}
