import { ISupplyRepository } from '../../domain/repositories/supply.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { CreateSupplyDTO } from '../dtos/supply.dto';
import { Supply } from '../../domain/entities/supply.entity';
import { Result } from '@/src/shared/domain/result';
import { DomainError, NotFoundError } from '@/src/shared/domain/errors';

export class CreateSupplyUseCase {
  constructor(
    private readonly supplyRepository: ISupplyRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(dto: CreateSupplyDTO): Promise<Result<Supply, DomainError>> {
    try {
      const business = await this.businessRepository.findById(dto.businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', dto.businessId));
      }

      const supply = Supply.create({
        businessId: dto.businessId,
        name: dto.name,
        description: dto.description,
        itemType: dto.itemType,
        category: dto.category,
        unitMeasure: dto.unitMeasure,
        currentStock: dto.currentStock,
        minStockAlert: dto.minStockAlert,
        costPerUnit: dto.costPerUnit,
        sku: dto.sku,
        supplierName: dto.supplierName,
        supplierContact: dto.supplierContact,
        isActive: dto.isActive,
      });

      const saved = await this.supplyRepository.save(supply);
      return Result.ok(saved);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
