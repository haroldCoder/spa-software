import { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import { Result } from '@/src/shared/domain/result';
import { DomainError, BadRequestError } from '@/src/shared/domain/errors';

export interface LogoutInputDTO {
  sessionId?: string;
  sessionToken?: string;
}

export class LogoutUseCase {
  constructor(private readonly sessionRepository: IAuthSessionRepository) {}

  public async execute(dto: LogoutInputDTO): Promise<Result<void, DomainError>> {
    try {
      if (dto.sessionId) {
        await this.sessionRepository.revoke(dto.sessionId);
      } else if (dto.sessionToken) {
        await this.sessionRepository.revokeByToken(dto.sessionToken);
      } else {
        return Result.fail(new BadRequestError('Se requiere sessionId o sessionToken para cerrar sesión.'));
      }
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al cerrar sesión'));
    }
  }
}
