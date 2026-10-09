import { ISupplyRepository, SupplyFilter } from '../../domain/repositories/supply.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { Supply } from '../../domain/entities/supply.entity';
import { PaginatedResult } from '@/src/shared/domain/pagination';
import { Result } from '@/src/shared/domain/result';
import { BadRequestError, DomainError, NotFoundError } from '@/src/shared/domain/errors';

export class ListSuppliesByBusinessUseCase {
  constructor(
    private readonly supplyRepository: ISupplyRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(
    businessId: string,
    filter?: SupplyFilter
  ): Promise<Result<PaginatedResult<Supply>, DomainError>> {
    try {
      if (!businessId || businessId.trim().length === 0) {
        return Result.fail(new BadRequestError('El ID del negocio (businessId) es obligatorio para listar los insumos.'));
      }

      const business = await this.businessRepository.findById(businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', businessId));
      }

      const result = await this.supplyRepository.findByBusinessId(businessId, filter);
      return Result.ok(result);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
