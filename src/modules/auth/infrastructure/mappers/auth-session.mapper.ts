import { AuthSession } from '../../domain/entities/auth-session.entity';
import { UserType } from '../../domain/entities/auth-user.entity';

export interface SupabaseAuthSessionRow {
  id: string;
  user_id: string;
  user_type: string;
  business_id: string;
  session_token: string;
  refresh_token: string | null;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  is_revoked: boolean;
  created_at: string;
  updated_at: string;
}

export class AuthSessionMapper {
  public static toDomain(row: SupabaseAuthSessionRow): AuthSession {
    return AuthSession.create({
      id: row.id,
      userId: row.user_id,
      userType: row.user_type as UserType,
      businessId: row.business_id,
      sessionToken: row.session_token,
      refreshToken: row.refresh_token,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      expiresAt: new Date(row.expires_at),
      isRevoked: row.is_revoked,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  public static toPersistence(entity: AuthSession): Partial<SupabaseAuthSessionRow> {
    const data: Partial<SupabaseAuthSessionRow> = {
      user_id: entity.userId,
      user_type: entity.userType,
      business_id: entity.businessId,
      session_token: entity.sessionToken,
      refresh_token: entity.refreshToken ?? null,
      ip_address: entity.ipAddress ?? null,
      user_agent: entity.userAgent ?? null,
      expires_at: entity.expiresAt.toISOString(),
      is_revoked: entity.isRevoked,
    };
    if (entity.id) {
      data.id = entity.id;
    }
    return data;
  }
}
