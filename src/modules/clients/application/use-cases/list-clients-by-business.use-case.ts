import { IClientRepository } from '../../domain/repositories/client.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError } from '@/src/shared/domain/errors';

export class ListClientsByBusinessUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(businessId: string, filter?: { isActive?: boolean }): Promise<Result<Client[], DomainError>> {
    try {
      const business = await this.businessRepository.findById(businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', businessId));
      }

      const clients = await this.clientRepository.findByBusinessId(businessId, filter);
      return Result.ok(clients);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new NotFoundError('Negocio', businessId));
    }
  }
}
