import { IBusinessRepository } from '../../domain/repositories/business.repository.interface';
import { Business } from '../../domain/entities/business.entity';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError } from '@/src/shared/domain/errors';

export class GetBusinessByIdUseCase {
  constructor(private readonly businessRepository: IBusinessRepository) {}

  public async execute(id: string): Promise<Result<Business, DomainError>> {
    try {
      const business = await this.businessRepository.findById(id);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', id));
      }
      return Result.ok(business);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new NotFoundError('Negocio', id));
    }
  }
}
