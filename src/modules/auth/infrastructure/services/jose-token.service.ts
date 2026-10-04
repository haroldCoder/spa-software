import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import { ITokenService } from '../../domain/services/token-service.interface';
import { TokenPayload } from '../../domain/entities/auth-user.entity';

export class JoseTokenService implements ITokenService {
  private readonly secretKey: Uint8Array;

  constructor(secret = process.env.JWT_SECRET || 'spa-software-super-secret-jwt-key-minimum-32-chars-long') {
    this.secretKey = new TextEncoder().encode(secret);
  }

  public async generateAccessToken(payload: TokenPayload, expiresIn = '2h'): Promise<string> {
    return new SignJWT({
      userId: payload.userId,
      businessId: payload.businessId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      userType: payload.userType,
      sessionId: payload.sessionId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(this.secretKey);
  }

  public generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  public generateSessionToken(): string {
    return crypto.randomUUID();
  }

  public async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey);
      if (!payload.userId || !payload.businessId || !payload.role || !payload.sessionId) {
        return null;
      }
      return {
        userId: payload.userId as string,
        businessId: payload.businessId as string,
        email: (payload.email as string) || '',
        name: (payload.name as string) || '',
        role: payload.role as TokenPayload['role'],
        userType: payload.userType as TokenPayload['userType'],
        sessionId: payload.sessionId as string,
      };
    } catch {
      return null;
    }
  }
}
