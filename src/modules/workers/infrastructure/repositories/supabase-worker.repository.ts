import { SupabaseClient } from '@supabase/supabase-js';
import { IWorkerRepository } from '../../domain/repositories/worker.repository.interface';
import { Worker } from '../../domain/entities/worker.entity';
import { WorkerMapper, SupabaseWorkerRow } from '../mappers/worker.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';

export class SupabaseWorkerRepository implements IWorkerRepository {
  private readonly tableName = 'workers';

  constructor(private readonly client: SupabaseClient) {}

  public async findById(id: string): Promise<Worker | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar trabajadora con id ${id}: ${error.message}`, error);
    }

    if (!data) return null;
    return WorkerMapper.toDomain(data as SupabaseWorkerRow);
  }

  public async findByBusinessId(businessId: string, filter?: { isActive?: boolean }): Promise<Worker[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('business_id', businessId)
      .order('first_name', { ascending: true });

    if (filter?.isActive !== undefined) {
      query = query.eq('is_active', filter.isActive);
    }

    const { data, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al listar trabajadoras para el negocio ${businessId}: ${error.message}`, error);
    }

    return (data as SupabaseWorkerRow[]).map(WorkerMapper.toDomain);
  }

  public async save(worker: Worker): Promise<Worker> {
    const row = WorkerMapper.toPersistence(worker);
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(row)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al registrar trabajadora: ${error.message}`, error);
    }

    return WorkerMapper.toDomain(data as SupabaseWorkerRow);
  }

  public async update(worker: Worker): Promise<Worker> {
    if (!worker.id) {
      throw new DatabaseError('No se puede actualizar una trabajadora sin identificador.');
    }

    const row = WorkerMapper.toPersistence(worker);
    const { data, error } = await this.client
      .from(this.tableName)
      .update(row)
      .eq('id', worker.id)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al actualizar trabajadora: ${error.message}`, error);
    }

    return WorkerMapper.toDomain(data as SupabaseWorkerRow);
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new DatabaseError(`Error al eliminar trabajadora: ${error.message}`, error);
    }
  }
}
