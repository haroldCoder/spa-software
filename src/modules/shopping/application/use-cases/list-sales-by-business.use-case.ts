import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError } from '@/src/shared/domain/errors';
import {
  ISaleRepository,
  SaleFilter,
  PaginatedSales,
} from '../../domain/repositories/sale.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';

export class ListSalesByBusinessUseCase {
  constructor(
    private readonly saleRepository: ISaleRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(
    businessId: string,
    filter?: SaleFilter
  ): Promise<Result<PaginatedSales, DomainError>> {
    try {
      const business = await this.businessRepository.findById(businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio o Spa', businessId));
      }

      const paginatedSales = await this.saleRepository.findByBusinessId(businessId, filter);
      return Result.ok(paginatedSales);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(
        new DatabaseError(
          error instanceof Error ? error.message : 'Error inesperado al listar las ventas del negocio.'
        )
      );
    }
  }
}
