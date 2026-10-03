import { IWorkerRepository } from '../../domain/repositories/worker.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { Worker } from '../../domain/entities/worker.entity';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError } from '@/src/shared/domain/errors';

export class ListWorkersByBusinessUseCase {
  constructor(
    private readonly workerRepository: IWorkerRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(businessId: string, filter?: { isActive?: boolean }): Promise<Result<Worker[], DomainError>> {
    try {
      const business = await this.businessRepository.findById(businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', businessId));
      }

      const workers = await this.workerRepository.findByBusinessId(businessId, filter);
      return Result.ok(workers);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new NotFoundError('Negocio', businessId));
    }
  }
}
