import { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import { ITokenService } from '../../domain/services/token-service.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';
import { RefreshTokenInputDTO, AuthTokensDTO } from '../dtos/auth.dto';
import { Result } from '@/src/shared/domain/result';
import { DomainError, UnauthorizedError, BadRequestError } from '@/src/shared/domain/errors';
import { TokenPayload } from '../../domain/entities/auth-user.entity';

export class RefreshTokenUseCase {
  constructor(
    private readonly sessionRepository: IAuthSessionRepository,
    private readonly tokenService: ITokenService,
    private readonly businessRepository: IBusinessRepository,
    private readonly workerRepository: IWorkerRepository
  ) {}

  public async execute(dto: RefreshTokenInputDTO): Promise<Result<AuthTokensDTO, DomainError>> {
    try {
      const session = await this.sessionRepository.findByRefreshToken(dto.refreshToken);
      if (!session || !session.isValid()) {
        return Result.fail(new UnauthorizedError('Sesión inválida, revocada o expirada.'));
      }

      let payload: TokenPayload;

      if (session.userType === 'BUSINESS') {
        const business = await this.businessRepository.findById(session.userId);
        if (!business || !business.isActive) {
          await this.sessionRepository.revoke(session.id!);
          return Result.fail(new UnauthorizedError('El negocio ya no existe o se encuentra inactivo.'));
        }
        payload = {
          userId: business.id!,
          businessId: business.id!,
          email: business.email,
          name: business.name,
          role: 'BUSINESS_OWNER',
          userType: 'BUSINESS',
          sessionId: session.id ?? session.sessionToken,
        };
      } else {
        const worker = await this.workerRepository.findById(session.userId);
        if (!worker || !worker.isActive) {
          await this.sessionRepository.revoke(session.id!);
          return Result.fail(new UnauthorizedError('La trabajadora ya no existe o se encuentra inactiva.'));
        }
        payload = {
          userId: worker.id!,
          businessId: worker.businessId,
          email: worker.email || '',
          name: worker.fullName,
          role: 'WORKER',
          userType: 'WORKER',
          sessionId: session.id ?? session.sessionToken,
        };
      }

      // Rotate refresh token and renew expiration
      const newRefreshToken = this.tokenService.generateRefreshToken();
      const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      session.renew(newExpiresAt, newRefreshToken);
      await this.sessionRepository.update(session);

      const newAccessToken = await this.tokenService.generateAccessToken(payload, '2h');

      return Result.ok({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: '2h',
        tokenType: 'Bearer',
      });
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al renovar el token'));
    }
  }
}
