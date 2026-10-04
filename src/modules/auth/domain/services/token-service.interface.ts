import { TokenPayload } from '../entities/auth-user.entity';

export interface ITokenService {
  generateAccessToken(payload: TokenPayload, expiresIn?: string): Promise<string>;
  generateRefreshToken(): string;
  generateSessionToken(): string;
  verifyAccessToken(token: string): Promise<TokenPayload | null>;
}
