import { SupabaseClient } from '@supabase/supabase-js';
import {
  ISaleRepository,
  SaleFilter,
  PaginatedSales,
} from '../../domain/repositories/sale.repository.interface';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleItemType } from '../../domain/entities/sale-item.entity';
import { SaleMapper, SupabaseSaleRow } from '../mappers/sale.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';
import { PaginatedResult, PaginationHelper } from '@/src/shared/domain/pagination';
import { SupabaseAppointmentRepository } from '@/src/modules/appointments/infrastructure/repositories/supabase-appointment.repository';
import { SupabaseAppointmentRow } from '@/src/modules/appointments/infrastructure/mappers/appointment.mapper';

export class SupabaseSaleRepository implements ISaleRepository {
  private readonly salesTable = 'sales';
  private readonly itemsTable = 'sale_items';
  private readonly appointmentRepo: SupabaseAppointmentRepository;
  private readonly selectFields = `
    *,
    clients (id, first_name, last_name, phone, email),
    workers (id, first_name, last_name, specialty, phone),
    sale_items (*)
  `;

  constructor(
    private readonly client: SupabaseClient,
    appointmentRepo?: SupabaseAppointmentRepository
  ) {
    this.appointmentRepo = appointmentRepo ?? new SupabaseAppointmentRepository(client);
  }

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

    if (data) return data as unknown as SupabaseSaleRow;

    // Si no se encuentra en la tabla de ventas, verificar si corresponde a una cita completada (servicio)
    const apt = await this.appointmentRepo.findByIdWithRelations(id);
    if (apt && apt.status === 'COMPLETED') {
      return this.mapAppointmentRowToSaleRow(apt);
    }

    return null;
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

    // Si el filtro solicita únicamente PRODUCTOS, consultamos únicamente la tabla de ventas
    if (filter?.itemType === 'PRODUCT') {
      let query = this.client
        .from(this.salesTable)
        .select(this.selectFields, { count: 'exact' })
        .eq('business_id', businessId)
        .gt('product_amount', 0)
        .order('created_at', { ascending: false });

      query = this.applyFilters(query, filter);
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) {
        throw new DatabaseError(`Error al consultar ventas de productos: ${error.message}`, error);
      }

      const total = count ?? 0;
      const rows = (data as unknown as SupabaseSaleRow[]) || [];
      return PaginationHelper.createResult(rows, total, page, limit);
    }

    // Si el filtro solicita únicamente SERVICIOS, obtenemos los servicios completados desde appointments
    if (filter?.itemType === 'SERVICE') {
      const completedServices = await this.findCompletedServicesWithRelations(businessId);
      const filteredServices = this.filterCompletedServiceRows(completedServices, filter);

      // También traer posibles ventas directas registradas en la tabla con service_amount > 0
      let query = this.client
        .from(this.salesTable)
        .select(this.selectFields)
        .eq('business_id', businessId)
        .gt('service_amount', 0)
        .order('created_at', { ascending: false });

      query = this.applyFilters(query, filter);
      const { data: directSales, error } = await query;
      if (error) {
        throw new DatabaseError(`Error al consultar ventas de servicios: ${error.message}`, error);
      }

      const directRows = (directSales as unknown as SupabaseSaleRow[]) || [];
      const combined = this.mergeAndSortSaleRows(directRows, filteredServices);

      const total = combined.length;
      const pagedRows = combined.slice(from, to + 1);
      return PaginationHelper.createResult(pagedRows, total, page, limit);
    }

    // Por defecto (sin filtro de tipo o ALL): combinar ventas físicas y servicios completados
    let query = this.client
      .from(this.salesTable)
      .select(this.selectFields)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    query = this.applyFilters(query, filter);
    const { data: directSales, error } = await query;
    if (error) {
      throw new DatabaseError(
        `Error al consultar ventas del negocio ${businessId}: ${error.message}`,
        error
      );
    }

    const salesRows = (directSales as unknown as SupabaseSaleRow[]) || [];
    const completedServices = await this.findCompletedServicesWithRelations(businessId);
    const filteredServices = this.filterCompletedServiceRows(completedServices, filter);

    const mergedRows = this.mergeAndSortSaleRows(salesRows, filteredServices);

    const total = mergedRows.length;
    const pagedRows = mergedRows.slice(from, to + 1);
    return PaginationHelper.createResult(pagedRows, total, page, limit);
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

  public async findCompletedServices(businessId: string): Promise<Sale[]> {
    const rows = await this.findCompletedServicesWithRelations(businessId);
    return rows.map(SaleMapper.toDomain);
  }

  public async findCompletedServicesWithRelations(businessId: string): Promise<SupabaseSaleRow[]> {
    const completedAppointments = await this.appointmentRepo.findByCompletedStatusWithRelations(businessId);
    return completedAppointments.map((apt) => this.mapAppointmentRowToSaleRow(apt));
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

  public mapAppointmentRowToSaleRow(aptRow: SupabaseAppointmentRow): SupabaseSaleRow {
    const serviceName = aptRow.catalog_items?.name || 'Servicio completado';
    const price = Number(aptRow.price) || 0;
    const dateStr = aptRow.scheduled_at || aptRow.created_at || new Date().toISOString();

    return {
      id: aptRow.id,
      business_id: aptRow.business_id,
      client_id: aptRow.client_id,
      worker_id: aptRow.worker_id,
      total_amount: price,
      service_amount: price,
      product_amount: 0,
      created_by_id: aptRow.created_by_id,
      created_by_role: aptRow.created_by_role,
      created_at: dateStr,
      updated_at: aptRow.updated_at || dateStr,
      clients: aptRow.clients,
      workers: aptRow.workers,
      sale_items: [
        {
          id: `item-apt-${aptRow.id}`,
          sale_id: aptRow.id,
          catalog_item_id: aptRow.service_id,
          item_type: SaleItemType.SERVICE,
          item_name: serviceName,
          quantity: 1,
          unit_price: price,
          subtotal: price,
          created_at: dateStr,
        },
      ],
    };
  }

  private filterCompletedServiceRows(
    rows: SupabaseSaleRow[],
    filter?: SaleFilter
  ): SupabaseSaleRow[] {
    if (!filter) return rows;

    return rows.filter((r) => {
      if (filter.clientId && r.client_id !== filter.clientId) return false;
      if (filter.workerId && r.worker_id !== filter.workerId) return false;
      if (filter.startDate) {
        const itemDate = new Date(r.created_at);
        if (itemDate < filter.startDate) return false;
      }
      if (filter.endDate) {
        const itemDate = new Date(r.created_at);
        if (itemDate > filter.endDate) return false;
      }
      return true;
    });
  }

  private mergeAndSortSaleRows(
    sales: SupabaseSaleRow[],
    services: SupabaseSaleRow[]
  ): SupabaseSaleRow[] {
    const existingIds = new Set<string>(sales.map((s) => s.id));
    const combined = [...sales];

    for (const service of services) {
      if (!existingIds.has(service.id)) {
        combined.push(service);
        existingIds.add(service.id);
      }
    }

    return combined.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeB - timeA;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
