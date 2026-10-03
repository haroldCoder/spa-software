import { ICatalogRepository } from '../../domain/repositories/catalog.repository.interface';
import { CatalogItem } from '../../domain/entities/catalog-item.entity';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError } from '@/src/shared/domain/errors';

export class GetCatalogItemByIdUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  public async execute(id: string): Promise<Result<CatalogItem, DomainError>> {
    try {
      const item = await this.catalogRepository.findById(id);
      if (!item) {
        return Result.fail(new NotFoundError('Artículo del catálogo', id));
      }
      return Result.ok(item);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new NotFoundError('Artículo del catálogo', id));
    }
  }
}
