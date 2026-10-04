import { SupabaseClient } from '@supabase/supabase-js';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { Business } from '@/src/modules/business/domain/entities/business.entity';
import { Worker } from '@/src/modules/workers/domain/entities/worker.entity';
import { BusinessMapper, SupabaseBusinessRow } from '@/src/modules/business/infrastructure/mappers/business.mapper';
import { WorkerMapper, SupabaseWorkerRow } from '@/src/modules/workers/infrastructure/mappers/worker.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';

export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  public async findBusinessByEmail(email: string): Promise<{ business: Business; passwordHash: string | null } | null> {
    const { data, error } = await this.client
      .from('businesses')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar negocio para autenticación: ${error.message}`, error);
    }

    if (!data) return null;

    const row = data as SupabaseBusinessRow;
    const business = BusinessMapper.toDomain(row);
    return {
      business,
      passwordHash: row.password_hash ?? null,
    };
  }

  public async findWorkerByEmail(email: string): Promise<{ worker: Worker; passwordHash: string | null } | null> {
    const { data, error } = await this.client
      .from('workers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar trabajadora para autenticación: ${error.message}`, error);
    }

    if (!data) return null;

    const row = data as SupabaseWorkerRow;
    const worker = WorkerMapper.toDomain(row);
    return {
      worker,
      passwordHash: row.password_hash ?? null,
    };
  }
}
