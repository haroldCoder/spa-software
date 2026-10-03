import { SupabaseClient } from '@supabase/supabase-js';
import { IClientRepository } from '../../domain/repositories/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { ClientMapper, SupabaseClientRow } from '../mappers/client.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';

export class SupabaseClientRepository implements IClientRepository {
  private readonly tableName = 'clients';

  constructor(private readonly client: SupabaseClient) {}

  public async findById(id: string): Promise<Client | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar cliente con id ${id}: ${error.message}`, error);
    }

    if (!data) return null;
    return ClientMapper.toDomain(data as SupabaseClientRow);
  }

  public async findByBusinessId(businessId: string, filter?: { isActive?: boolean }): Promise<Client[]> {
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
      throw new DatabaseError(`Error al consultar clientes del negocio ${businessId}: ${error.message}`, error);
    }

    return (data as SupabaseClientRow[]).map(ClientMapper.toDomain);
  }

  public async findByWorkerId(workerId: string, filter?: { isActive?: boolean }): Promise<Client[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('primary_worker_id', workerId)
      .order('first_name', { ascending: true });

    if (filter?.isActive !== undefined) {
      query = query.eq('is_active', filter.isActive);
    }

    const { data, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al consultar clientes de la trabajadora ${workerId}: ${error.message}`, error);
    }

    return (data as SupabaseClientRow[]).map(ClientMapper.toDomain);
  }

  public async save(clientEntity: Client): Promise<Client> {
    const row = ClientMapper.toPersistence(clientEntity);
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(row)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al guardar cliente: ${error.message}`, error);
    }

    return ClientMapper.toDomain(data as SupabaseClientRow);
  }

  public async update(clientEntity: Client): Promise<Client> {
    if (!clientEntity.id) {
      throw new DatabaseError('No se puede actualizar un cliente sin identificador.');
    }

    const row = ClientMapper.toPersistence(clientEntity);
    const { data, error } = await this.client
      .from(this.tableName)
      .update(row)
      .eq('id', clientEntity.id)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al actualizar cliente: ${error.message}`, error);
    }

    return ClientMapper.toDomain(data as SupabaseClientRow);
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new DatabaseError(`Error al eliminar cliente: ${error.message}`, error);
    }
  }
}
