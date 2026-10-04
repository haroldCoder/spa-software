import { SupabaseClient } from '@supabase/supabase-js';
import { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import { AuthSessionMapper, SupabaseAuthSessionRow } from '../mappers/auth-session.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';

export class SupabaseAuthSessionRepository implements IAuthSessionRepository {
  private readonly tableName = 'auth_sessions';

  constructor(private readonly client: SupabaseClient) {}

  public async create(session: AuthSession): Promise<AuthSession> {
    const row = AuthSessionMapper.toPersistence(session);
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(row)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al crear la sesión de autenticación: ${error.message}`, error);
    }

    return AuthSessionMapper.toDomain(data as SupabaseAuthSessionRow);
  }

  public async findById(id: string): Promise<AuthSession | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar la sesión con id ${id}: ${error.message}`, error);
    }

    if (!data) return null;
    return AuthSessionMapper.toDomain(data as SupabaseAuthSessionRow);
  }

  public async findBySessionToken(token: string): Promise<AuthSession | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('session_token', token)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar la sesión por token: ${error.message}`, error);
    }

    if (!data) return null;
    return AuthSessionMapper.toDomain(data as SupabaseAuthSessionRow);
  }

  public async findByRefreshToken(refreshToken: string): Promise<AuthSession | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('refresh_token', refreshToken)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar la sesión por refresh token: ${error.message}`, error);
    }

    if (!data) return null;
    return AuthSessionMapper.toDomain(data as SupabaseAuthSessionRow);
  }

  public async findByUserId(userId: string): Promise<AuthSession[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('is_revoked', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError(`Error al listar sesiones de usuario: ${error.message}`, error);
    }

    return (data as SupabaseAuthSessionRow[]).map(AuthSessionMapper.toDomain);
  }

  public async update(session: AuthSession): Promise<AuthSession> {
    if (!session.id) {
      throw new DatabaseError('No se puede actualizar una sesión sin identificador.');
    }

    const row = AuthSessionMapper.toPersistence(session);
    const { data, error } = await this.client
      .from(this.tableName)
      .update(row)
      .eq('id', session.id)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al actualizar sesión: ${error.message}`, error);
    }

    return AuthSessionMapper.toDomain(data as SupabaseAuthSessionRow);
  }

  public async revoke(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ is_revoked: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new DatabaseError(`Error al revocar la sesión ${id}: ${error.message}`, error);
    }
  }

  public async revokeByToken(token: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ is_revoked: true, updated_at: new Date().toISOString() })
      .eq('session_token', token);

    if (error) {
      throw new DatabaseError(`Error al revocar la sesión por token: ${error.message}`, error);
    }
  }

  public async revokeAllForUser(userId: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ is_revoked: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      throw new DatabaseError(`Error al revocar todas las sesiones del usuario: ${error.message}`, error);
    }
  }
}
