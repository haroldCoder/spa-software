import { BadRequestError } from '@/src/shared/domain/errors';
import { UserType } from './auth-user.entity';

export interface AuthSessionProps {
  id?: string;
  userId: string;
  userType: UserType;
  businessId: string;
  sessionToken: string;
  refreshToken?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
  isRevoked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AuthSession {
  private readonly _id?: string;
  private readonly _userId: string;
  private readonly _userType: UserType;
  private readonly _businessId: string;
  private readonly _sessionToken: string;
  private _refreshToken?: string | null;
  private readonly _ipAddress?: string | null;
  private readonly _userAgent?: string | null;
  private _expiresAt: Date;
  private _isRevoked: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  private constructor(props: AuthSessionProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._userType = props.userType;
    this._businessId = props.businessId;
    this._sessionToken = props.sessionToken;
    this._refreshToken = props.refreshToken ?? null;
    this._ipAddress = props.ipAddress ?? null;
    this._userAgent = props.userAgent ?? null;
    this._expiresAt = props.expiresAt;
    this._isRevoked = props.isRevoked ?? false;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: AuthSessionProps): AuthSession {
    if (!props.userId) {
      throw new BadRequestError('El identificador de usuario es obligatorio para crear la sesión.');
    }
    if (!props.businessId) {
      throw new BadRequestError('El identificador de negocio es obligatorio para la sesión.');
    }
    if (!props.sessionToken) {
      throw new BadRequestError('El token de sesión es obligatorio.');
    }
    return new AuthSession(props);
  }

  public get id(): string | undefined {
    return this._id;
  }
  public get userId(): string {
    return this._userId;
  }
  public get userType(): UserType {
    return this._userType;
  }
  public get businessId(): string {
    return this._businessId;
  }
  public get sessionToken(): string {
    return this._sessionToken;
  }
  public get refreshToken(): string | null | undefined {
    return this._refreshToken;
  }
  public get ipAddress(): string | null | undefined {
    return this._ipAddress;
  }
  public get userAgent(): string | null | undefined {
    return this._userAgent;
  }
  public get expiresAt(): Date {
    return this._expiresAt;
  }
  public get isRevoked(): boolean {
    return this._isRevoked;
  }
  public get createdAt(): Date | undefined {
    return this._createdAt;
  }
  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  public isValid(): boolean {
    return !this._isRevoked && this._expiresAt.getTime() > Date.now();
  }

  public revoke(): void {
    this._isRevoked = true;
    this._updatedAt = new Date();
  }

  public renew(newExpiresAt: Date, newRefreshToken?: string): void {
    this._expiresAt = newExpiresAt;
    if (newRefreshToken) {
      this._refreshToken = newRefreshToken;
    }
    this._updatedAt = new Date();
  }
}
