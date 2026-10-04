import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import { ITokenService } from '../../domain/services/token-service.interface';
import { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import { LoginWorkerInputDTO, AuthResponseDTO } from '../dtos/auth.dto';
import { Result } from '@/src/shared/domain/result';
import { DomainError, UnauthorizedError, BadRequestError } from '@/src/shared/domain/errors';
import { ClientMetadata } from './register-business.use-case';

export class LoginWorkerUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly businessRepository: IBusinessRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly sessionRepository: IAuthSessionRepository
  ) { }

  public async execute(
    dto: LoginWorkerInputDTO,
    metadata?: ClientMetadata
  ): Promise<Result<AuthResponseDTO, DomainError>> {
    try {
      const record = await this.authRepository.findWorkerByEmail(dto.email);
      if (!record || !record.worker.id) {
        return Result.fail(new UnauthorizedError('Credenciales incorrectas o trabajadora no encontrada.'));
      }

      const { worker, passwordHash } = record;
      const workerId = worker.id!;

      if (!worker.isActive) {
        return Result.fail(new UnauthorizedError('La cuenta de la trabajadora se encuentra desactivada.'));
      }

      if (!passwordHash) {
        return Result.fail(
          new UnauthorizedError('La trabajadora no tiene una contraseña configurada en el sistema. Contacta al administrador.')
        );
      }

      // Check if associated business is active
      const business = await this.businessRepository.findById(worker.businessId);
      if (!business || !business.isActive) {
        return Result.fail(new UnauthorizedError('El spa o negocio asociado no se encuentra activo.'));
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
        userId: workerId,
        userType: 'WORKER',
        businessId: worker.businessId,
        sessionToken,
        refreshToken,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        expiresAt: sessionExpiresAt,
      });

      const savedSession = await this.sessionRepository.create(session);

      // Generate JWT
      const accessToken = await this.tokenService.generateAccessToken({
        userId: workerId,
        businessId: worker.businessId,
        email: worker.email || '',
        name: worker.fullName,
        role: 'WORKER',
        userType: 'WORKER',
        sessionId: savedSession.id ?? sessionToken,
      });

      return Result.ok({
        user: {
          id: workerId,
          businessId: worker.businessId,
          email: worker.email || '',
          name: worker.fullName,
          role: 'WORKER',
          userType: 'WORKER',
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
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al iniciar sesión de trabajadora'));
    }
  }
}
