import { ICatalogRepository } from '../../domain/repositories/catalog.repository.interface';
import { CatalogItem } from '../../domain/entities/catalog-item.entity';
import { UpdateCatalogItemDTO } from '../dtos/catalog-item.dto';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, BadRequestError } from '@/src/shared/domain/errors';

export class UpdateCatalogItemUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  public async execute(id: string, dto: UpdateCatalogItemDTO): Promise<Result<CatalogItem, DomainError>> {
    try {
      const item = await this.catalogRepository.findById(id);
      if (!item) {
        return Result.fail(new NotFoundError('Artículo del catálogo', id));
      }

      item.update(dto);
      const updated = await this.catalogRepository.update(item);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : `Error al actualizar artículo con id '${id}'`));
    }
  }
}
