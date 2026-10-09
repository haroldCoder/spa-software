import { ISupplyRepository, SupplySummaryData } from '../../domain/repositories/supply.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { Result } from '@/src/shared/domain/result';
import { BadRequestError, DomainError, NotFoundError } from '@/src/shared/domain/errors';

export class GetSuppliesSummaryUseCase {
  constructor(
    private readonly supplyRepository: ISupplyRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(businessId: string): Promise<Result<SupplySummaryData, DomainError>> {
    try {
      if (!businessId || businessId.trim().length === 0) {
        return Result.fail(new BadRequestError('El ID del negocio (businessId) es obligatorio para obtener el resumen.'));
      }

      const business = await this.businessRepository.findById(businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', businessId));
      }

      const summary = await this.supplyRepository.getSummaryByBusiness(businessId);
      return Result.ok(summary);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
