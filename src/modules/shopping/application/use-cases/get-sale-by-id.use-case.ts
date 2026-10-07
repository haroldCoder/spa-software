import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError } from '@/src/shared/domain/errors';
import { ISaleRepository } from '../../domain/repositories/sale.repository.interface';
import { Sale } from '../../domain/entities/sale.entity';

export class GetSaleByIdUseCase {
  constructor(private readonly saleRepository: ISaleRepository) {}

  public async execute(id: string): Promise<Result<Sale, DomainError>> {
    try {
      const sale = await this.saleRepository.findById(id);
      if (!sale) {
        return Result.fail(new NotFoundError('Venta / Compra', id));
      }
      return Result.ok(sale);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(
        new DatabaseError(
          error instanceof Error ? error.message : `Error al consultar la venta con id ${id}.`
        )
      );
    }
  }
}
