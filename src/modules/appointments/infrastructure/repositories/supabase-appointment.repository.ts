import { SupabaseClient } from '@supabase/supabase-js';
import {
  IAppointmentRepository,
  AppointmentFilter,
  PaginatedAppointments,
} from '../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../domain/entities/appointment.entity';
import { AppointmentMapper, SupabaseAppointmentRow } from '../mappers/appointment.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';
import { PaginatedResult, PaginationHelper } from '@/src/shared/domain/pagination';

export class SupabaseAppointmentRepository implements IAppointmentRepository {
  private readonly tableName = 'appointments';
  private readonly selectFields = `
    *,
    clients (id, first_name, last_name, phone, email),
    workers (id, first_name, last_name, specialty, phone),
    catalog_items (id, name, category, price, duration_minutes, image_url)
  `;

  constructor(private readonly client: SupabaseClient) {}

  public async findById(id: string): Promise<Appointment | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(this.selectFields)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar cita con id ${id}: ${error.message}`, error);
    }

    if (!data) return null;
    return AppointmentMapper.toDomain(data as unknown as SupabaseAppointmentRow);
  }

  public async findByIdWithRelations(id: string): Promise<SupabaseAppointmentRow | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(this.selectFields)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar cita con id ${id}: ${error.message}`, error);
    }

    if (!data) return null;
    return data as unknown as SupabaseAppointmentRow;
  }

  public async findByBusinessId(
    businessId: string,
    filter?: AppointmentFilter
  ): Promise<PaginatedAppointments> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.tableName)
      .select(this.selectFields, { count: 'exact' })
      .eq('business_id', businessId)
      .order('scheduled_at', { ascending: true });

    query = this.applyFilters(query, filter);
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al consultar citas del negocio ${businessId}: ${error.message}`, error);
    }

    const total = count ?? 0;
    const items = (data as unknown as SupabaseAppointmentRow[]).map(AppointmentMapper.toDomain);
    return PaginationHelper.createResult(items, total, page, limit);
  }

  public async findByBusinessIdWithRelations(
    businessId: string,
    filter?: AppointmentFilter
  ): Promise<PaginatedResult<SupabaseAppointmentRow>> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.tableName)
      .select(this.selectFields, { count: 'exact' })
      .eq('business_id', businessId)
      .order('scheduled_at', { ascending: true });

    query = this.applyFilters(query, filter);
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al consultar citas del negocio ${businessId}: ${error.message}`, error);
    }

    const total = count ?? 0;
    const rows = (data as unknown as SupabaseAppointmentRow[]) || [];
    return PaginationHelper.createResult(rows, total, page, limit);
  }

  public async findByWorkerId(
    workerId: string,
    filter?: AppointmentFilter
  ): Promise<PaginatedAppointments> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.tableName)
      .select(this.selectFields, { count: 'exact' })
      .eq('worker_id', workerId)
      .order('scheduled_at', { ascending: true });

    query = this.applyFilters(query, filter);
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al consultar citas de la trabajadora ${workerId}: ${error.message}`, error);
    }

    const total = count ?? 0;
    const items = (data as unknown as SupabaseAppointmentRow[]).map(AppointmentMapper.toDomain);
    return PaginationHelper.createResult(items, total, page, limit);
  }

  public async findByWorkerIdWithRelations(
    workerId: string,
    filter?: AppointmentFilter
  ): Promise<PaginatedResult<SupabaseAppointmentRow>> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.tableName)
      .select(this.selectFields, { count: 'exact' })
      .eq('worker_id', workerId)
      .order('scheduled_at', { ascending: true });

    query = this.applyFilters(query, filter);
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al consultar citas de la trabajadora ${workerId}: ${error.message}`, error);
    }

    const total = count ?? 0;
    const rows = (data as unknown as SupabaseAppointmentRow[]) || [];
    return PaginationHelper.createResult(rows, total, page, limit);
  }

  public async findByClientId(
    clientId: string,
    filter?: AppointmentFilter
  ): Promise<PaginatedAppointments> {
    const { page, limit, from, to } = PaginationHelper.normalize(filter);

    let query = this.client
      .from(this.tableName)
      .select(this.selectFields, { count: 'exact' })
      .eq('client_id', clientId)
      .order('scheduled_at', { ascending: true });

    query = this.applyFilters(query, filter);
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al consultar citas del cliente ${clientId}: ${error.message}`, error);
    }

    const total = count ?? 0;
    const items = (data as unknown as SupabaseAppointmentRow[]).map(AppointmentMapper.toDomain);
    return PaginationHelper.createResult(items, total, page, limit);
  }

  public async findOverlapping(
    workerId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string
  ): Promise<Appointment[]> {
    // Solapamiento: scheduled_at < endTime AND end_time > startTime AND status != 'CANCELLED'
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('worker_id', workerId)
      .neq('status', 'CANCELLED')
      .lt('scheduled_at', endTime.toISOString())
      .gt('end_time', startTime.toISOString());

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { data, error } = await query;
    if (error) {
      throw new DatabaseError(
        `Error al verificar solapamiento de horario para la trabajadora ${workerId}: ${error.message}`,
        error
      );
    }

    return (data as unknown as SupabaseAppointmentRow[]).map(AppointmentMapper.toDomain);
  }

  public async save(appointment: Appointment): Promise<Appointment> {
    const row = AppointmentMapper.toPersistence(appointment);

    const { data, error } = await this.client
      .from(this.tableName)
      .insert(row)
      .select(this.selectFields)
      .single();

    if (error) {
      throw new DatabaseError(`Error al registrar la cita: ${error.message}`, error);
    }

    return AppointmentMapper.toDomain(data as unknown as SupabaseAppointmentRow);
  }

  public async update(appointment: Appointment): Promise<Appointment> {
    if (!appointment.id) {
      throw new DatabaseError('No se puede actualizar una cita sin ID.');
    }

    const row = AppointmentMapper.toPersistence(appointment);

    const { data, error } = await this.client
      .from(this.tableName)
      .update(row)
      .eq('id', appointment.id)
      .select(this.selectFields)
      .single();

    if (error) {
      throw new DatabaseError(`Error al actualizar la cita con id ${appointment.id}: ${error.message}`, error);
    }

    return AppointmentMapper.toDomain(data as unknown as SupabaseAppointmentRow);
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.client.from(this.tableName).delete().eq('id', id);

    if (error) {
      throw new DatabaseError(`Error al eliminar la cita con id ${id}: ${error.message}`, error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters(query: any, filter?: AppointmentFilter) {
    if (!filter) return query;

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        query = query.in('status', filter.status);
      } else {
        query = query.eq('status', filter.status);
      }
    }

    if (filter.workerId) {
      query = query.eq('worker_id', filter.workerId);
    }

    if (filter.clientId) {
      query = query.eq('client_id', filter.clientId);
    }

    if (filter.serviceId) {
      query = query.eq('service_id', filter.serviceId);
    }

    if (filter.startDate) {
      query = query.gte('scheduled_at', filter.startDate.toISOString());
    }

    if (filter.endDate) {
      query = query.lte('scheduled_at', filter.endDate.toISOString());
    }

    return query;
  }
}
