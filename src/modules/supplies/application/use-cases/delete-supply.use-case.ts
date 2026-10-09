import { ISupplyRepository } from '../../domain/repositories/supply.repository.interface';
import { Result } from '@/src/shared/domain/result';
import { DomainError, ForbiddenError, NotFoundError } from '@/src/shared/domain/errors';

export class DeleteSupplyUseCase {
  constructor(private readonly supplyRepository: ISupplyRepository) {}

  public async execute(id: string, businessId: string): Promise<Result<void, DomainError>> {
    try {
      const supply = await this.supplyRepository.findById(id);
      if (!supply) {
        return Result.fail(new NotFoundError('Insumo o útil', id));
      }

      if (supply.businessId !== businessId) {
        return Result.fail(new ForbiddenError('No tienes permisos para desactivar insumos de otro negocio.'));
      }

      supply.deactivate();
      await this.supplyRepository.update(supply);
      return Result.ok();
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
