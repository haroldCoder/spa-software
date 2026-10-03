import { IBusinessRepository } from '../../domain/repositories/business.repository.interface';
import { Business } from '../../domain/entities/business.entity';
import { Result } from '@/src/shared/domain/result';
import { DomainError } from '@/src/shared/domain/errors';

export class ListBusinessesUseCase {
  constructor(private readonly businessRepository: IBusinessRepository) {}

  public async execute(filter?: { isActive?: boolean }): Promise<Result<Business[], DomainError>> {
    try {
      const list = await this.businessRepository.findAll(filter);
      return Result.ok(list);
    } catch (error) {
      return Result.fail(error as DomainError);
    }
  }
}
