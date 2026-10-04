import { AuthSession } from '../entities/auth-session.entity';

export interface IAuthSessionRepository {
  create(session: AuthSession): Promise<AuthSession>;
  findById(id: string): Promise<AuthSession | null>;
  findBySessionToken(token: string): Promise<AuthSession | null>;
  findByRefreshToken(refreshToken: string): Promise<AuthSession | null>;
  findByUserId(userId: string): Promise<AuthSession[]>;
  update(session: AuthSession): Promise<AuthSession>;
  revoke(id: string): Promise<void>;
  revokeByToken(token: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
