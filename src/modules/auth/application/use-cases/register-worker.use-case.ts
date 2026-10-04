import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { Worker } from '@/src/modules/workers/domain/entities/worker.entity';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import { ITokenService } from '../../domain/services/token-service.interface';
import { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import { RegisterWorkerInputDTO, AuthResponseDTO } from '../dtos/auth.dto';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, ConflictError, DomainError, BadRequestError } from '@/src/shared/domain/errors';
import { ClientMetadata } from './register-business.use-case';

export class RegisterWorkerUseCase {
  constructor(
    private readonly workerRepository: IWorkerRepository,
    private readonly businessRepository: IBusinessRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly sessionRepository: IAuthSessionRepository
  ) {}

  public async execute(
    dto: RegisterWorkerInputDTO,
    metadata?: ClientMetadata
  ): Promise<Result<AuthResponseDTO, DomainError>> {
    try {
      // 1. Verify business exists and is active
      const business = await this.businessRepository.findById(dto.businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', dto.businessId));
      }
      if (!business.isActive) {
        return Result.fail(new BadRequestError('El spa o negocio especificado se encuentra inactivo.'));
      }

      // 2. Check for duplicate worker email
      const existingWithEmail = await this.workerRepository.findByEmail(dto.email);
      if (existingWithEmail) {
        return Result.fail(new ConflictError(`Ya existe una trabajadora registrada con el email '${dto.email}'.`));
      }

      // 3. Hash password
      const passwordHash = await this.passwordHasher.hash(dto.password);

      // 4. Create and save worker
      const worker = Worker.create({
        businessId: dto.businessId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        role: 'WORKER',
        phone: dto.phone,
        specialty: dto.specialty,
        commissionPercentage: dto.commissionPercentage,
        isActive: true,
      });

      const savedWorker = await this.workerRepository.save(worker);
      const workerId = savedWorker.id;
      if (!workerId) {
        return Result.fail(new BadRequestError('No se pudo generar el ID de la trabajadora.'));
      }

      // 5. Create session in auth_sessions
      const sessionToken = this.tokenService.generateSessionToken();
      const refreshToken = this.tokenService.generateRefreshToken();
      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const session = AuthSession.create({
        userId: workerId,
        userType: 'WORKER',
        businessId: savedWorker.businessId,
        sessionToken,
        refreshToken,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        expiresAt: sessionExpiresAt,
      });

      const savedSession = await this.sessionRepository.create(session);

      // 6. Generate JWT
      const accessToken = await this.tokenService.generateAccessToken({
        userId: workerId,
        businessId: savedWorker.businessId,
        email: savedWorker.email || '',
        name: savedWorker.fullName,
        role: 'WORKER',
        userType: 'WORKER',
        sessionId: savedSession.id ?? sessionToken,
      });

      return Result.ok({
        user: {
          id: workerId,
          businessId: savedWorker.businessId,
          email: savedWorker.email || '',
          name: savedWorker.fullName,
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
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al registrar la trabajadora'));
    }
  }
}
