import { ISupplyRepository } from '../../domain/repositories/supply.repository.interface';
import { UpdateSupplyDTO } from '../dtos/supply.dto';
import { Supply } from '../../domain/entities/supply.entity';
import { Result } from '@/src/shared/domain/result';
import { DomainError, ForbiddenError, NotFoundError } from '@/src/shared/domain/errors';

export class UpdateSupplyUseCase {
  constructor(private readonly supplyRepository: ISupplyRepository) {}

  public async execute(
    id: string,
    businessId: string,
    dto: UpdateSupplyDTO
  ): Promise<Result<Supply, DomainError>> {
    try {
      const supply = await this.supplyRepository.findById(id);
      if (!supply) {
        return Result.fail(new NotFoundError('Insumo o útil', id));
      }

      if (supply.businessId !== businessId) {
        return Result.fail(new ForbiddenError('No tienes permisos para modificar insumos de otro negocio.'));
      }

      supply.updateDetails(dto);
      const updated = await this.supplyRepository.update(supply);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
