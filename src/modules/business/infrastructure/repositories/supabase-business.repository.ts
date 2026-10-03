import { SupabaseClient } from '@supabase/supabase-js';
import { IBusinessRepository } from '../../domain/repositories/business.repository.interface';
import { Business } from '../../domain/entities/business.entity';
import { BusinessMapper, SupabaseBusinessRow } from '../mappers/business.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';

export class SupabaseBusinessRepository implements IBusinessRepository {
  private readonly tableName = 'businesses';

  constructor(private readonly client: SupabaseClient) {}

  public async findById(id: string): Promise<Business | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar negocio con id ${id}: ${error.message}`, error);
    }

    if (!data) return null;
    return BusinessMapper.toDomain(data as SupabaseBusinessRow);
  }

  public async findByEmail(email: string): Promise<Business | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar negocio por email ${email}: ${error.message}`, error);
    }

    if (!data) return null;
    return BusinessMapper.toDomain(data as SupabaseBusinessRow);
  }

  public async findAll(filter?: { isActive?: boolean }): Promise<Business[]> {
    let query = this.client.from(this.tableName).select('*').order('created_at', { ascending: false });

    if (filter?.isActive !== undefined) {
      query = query.eq('is_active', filter.isActive);
    }

    const { data, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al listar negocios: ${error.message}`, error);
    }

    return (data as SupabaseBusinessRow[]).map(BusinessMapper.toDomain);
  }

  public async save(business: Business): Promise<Business> {
    const row = BusinessMapper.toPersistence(business);
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(row)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al guardar negocio: ${error.message}`, error);
    }

    return BusinessMapper.toDomain(data as SupabaseBusinessRow);
  }

  public async update(business: Business): Promise<Business> {
    if (!business.id) {
      throw new DatabaseError('No se puede actualizar un negocio sin identificador.');
    }

    const row = BusinessMapper.toPersistence(business);
    const { data, error } = await this.client
      .from(this.tableName)
      .update(row)
      .eq('id', business.id)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al actualizar negocio: ${error.message}`, error);
    }

    return BusinessMapper.toDomain(data as SupabaseBusinessRow);
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new DatabaseError(`Error al eliminar negocio: ${error.message}`, error);
    }
  }
}
