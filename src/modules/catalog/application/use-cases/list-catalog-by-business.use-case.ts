import { ICatalogRepository, CatalogFilter } from '../../domain/repositories/catalog.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { CatalogItem } from '../../domain/entities/catalog-item.entity';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError } from '@/src/shared/domain/errors';

export class ListCatalogByBusinessUseCase {
  constructor(
    private readonly catalogRepository: ICatalogRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(businessId: string, filter?: CatalogFilter): Promise<Result<CatalogItem[], DomainError>> {
    try {
      const business = await this.businessRepository.findById(businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', businessId));
      }

      const items = await this.catalogRepository.findByBusinessId(businessId, filter);
      return Result.ok(items);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new NotFoundError('Negocio', businessId));
    }
  }
}
