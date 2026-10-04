import { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';
import { TokenPayload } from '../../domain/entities/auth-user.entity';
import { AuthenticatedUserDTO } from '../dtos/auth.dto';
import { Result } from '@/src/shared/domain/result';
import { DomainError, UnauthorizedError, BadRequestError } from '@/src/shared/domain/errors';

export class GetCurrentUserUseCase {
  constructor(
    private readonly sessionRepository: IAuthSessionRepository,
    private readonly businessRepository: IBusinessRepository,
    private readonly workerRepository: IWorkerRepository
  ) {}

  public async execute(payload: TokenPayload): Promise<Result<AuthenticatedUserDTO, DomainError>> {
    try {
      // 1. Check session status
      const session = await this.sessionRepository.findById(payload.sessionId);
      if (!session || !session.isValid()) {
        return Result.fail(new UnauthorizedError('La sesión ha sido revocada o ha expirado.'));
      }

      // 2. Fetch fresh user details
      if (payload.userType === 'BUSINESS') {
        const business = await this.businessRepository.findById(payload.userId);
        if (!business || !business.isActive) {
          return Result.fail(new UnauthorizedError('El spa o negocio se encuentra inactivo.'));
        }
        return Result.ok({
          id: business.id!,
          businessId: business.id!,
          email: business.email,
          name: business.name,
          role: 'BUSINESS_OWNER',
          userType: 'BUSINESS',
        });
      } else {
        const worker = await this.workerRepository.findById(payload.userId);
        if (!worker || !worker.isActive) {
          return Result.fail(new UnauthorizedError('La trabajadora se encuentra inactiva.'));
        }
        return Result.ok({
          id: worker.id!,
          businessId: worker.businessId,
          email: worker.email || '',
          name: worker.fullName,
          role: 'WORKER',
          userType: 'WORKER',
        });
      }
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al consultar usuario'));
    }
  }
}
