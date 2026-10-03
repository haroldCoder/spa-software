import { ICatalogRepository } from '../../domain/repositories/catalog.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { CatalogItem } from '../../domain/entities/catalog-item.entity';
import { CreateCatalogItemDTO } from '../dtos/catalog-item.dto';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, BadRequestError } from '@/src/shared/domain/errors';

export class CreateCatalogItemUseCase {
  constructor(
    private readonly catalogRepository: ICatalogRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(dto: CreateCatalogItemDTO): Promise<Result<CatalogItem, DomainError>> {
    try {
      const business = await this.businessRepository.findById(dto.businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', dto.businessId));
      }

      if (dto.itemType === 'SERVICE' && !dto.durationMinutes) {
        return Result.fail(new BadRequestError('Los servicios deben especificar una duración en minutos.'));
      }

      const item = CatalogItem.create({
        businessId: dto.businessId,
        name: dto.name,
        description: dto.description,
        itemType: dto.itemType,
        category: dto.category,
        price: dto.price,
        cost: dto.cost,
        durationMinutes: dto.durationMinutes,
        stockQuantity: dto.stockQuantity,
        sku: dto.sku,
        isActive: true,
      });

      const saved = await this.catalogRepository.save(item);
      return Result.ok(saved);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al registrar el elemento en el catálogo'));
    }
  }
}
