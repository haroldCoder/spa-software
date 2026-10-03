import { ICatalogRepository } from '../../domain/repositories/catalog.repository.interface';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError } from '@/src/shared/domain/errors';

export class DeleteCatalogItemUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  public async execute(id: string): Promise<Result<void, DomainError>> {
    try {
      const item = await this.catalogRepository.findById(id);
      if (!item) {
        return Result.fail(new NotFoundError('Artículo del catálogo', id));
      }

      await this.catalogRepository.delete(id);
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new NotFoundError('Artículo del catálogo', id));
    }
  }
}
