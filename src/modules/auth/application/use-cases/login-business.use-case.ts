import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import { ITokenService } from '../../domain/services/token-service.interface';
import { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import { LoginBusinessInputDTO, AuthResponseDTO } from '../dtos/auth.dto';
import { Result } from '@/src/shared/domain/result';
import { DomainError, UnauthorizedError, BadRequestError } from '@/src/shared/domain/errors';
import { ClientMetadata } from './register-business.use-case';

export class LoginBusinessUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly sessionRepository: IAuthSessionRepository
  ) { }

  public async execute(
    dto: LoginBusinessInputDTO,
    metadata?: ClientMetadata
  ): Promise<Result<AuthResponseDTO, DomainError>> {
    try {
      const record = await this.authRepository.findBusinessByEmail(dto.email);
      if (!record || !record.business.id) {
        return Result.fail(new UnauthorizedError('Credenciales incorrectas o negocio no encontrado.'));
      }

      const { business, passwordHash } = record;
      const businessId = business.id!;

      if (!business.isActive) {
        return Result.fail(new UnauthorizedError('La cuenta de este spa se encuentra inactiva.'));
      }

      if (!passwordHash) {
        return Result.fail(
          new UnauthorizedError('Este spa no tiene una contraseña configurada. Por favor regístrate o contacta soporte.')
        );
      }

      const isMatch = await this.passwordHasher.compare(dto.password, passwordHash);
      if (!isMatch) {
        return Result.fail(new UnauthorizedError('Credenciales incorrectas.'));
      }

      // Create session in auth_sessions table
      const sessionToken = this.tokenService.generateSessionToken();
      const refreshToken = this.tokenService.generateRefreshToken();
      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const session = AuthSession.create({
        userId: businessId,
        userType: 'BUSINESS',
        businessId: businessId,
        sessionToken,
        refreshToken,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        expiresAt: sessionExpiresAt,
      });

      const savedSession = await this.sessionRepository.create(session);

      // Generate JWT
      const accessToken = await this.tokenService.generateAccessToken({
        userId: businessId,
        businessId: businessId,
        email: business.email,
        name: business.name,
        role: 'BUSINESS_OWNER',
        userType: 'BUSINESS',
        sessionId: savedSession.id ?? sessionToken,
      });

      return Result.ok({
        user: {
          id: businessId,
          businessId: businessId,
          email: business.email,
          name: business.name,
          role: 'BUSINESS_OWNER',
          userType: 'BUSINESS',
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '2h',
          tokenType: 'Bearer',
        },
        session: {
          id: savedSession.id ?? sessionToken,
          expiresAt: sessionExpiresAt.toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al iniciar sesión'));
    }
  }
}
