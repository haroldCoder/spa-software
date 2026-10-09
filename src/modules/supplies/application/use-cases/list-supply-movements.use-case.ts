import { ISupplyMovementRepository, SupplyMovementFilter } from '../../domain/repositories/supply-movement.repository.interface';
import { ISupplyRepository } from '../../domain/repositories/supply.repository.interface';
import { SupplyMovement } from '../../domain/entities/supply-movement.entity';
import { PaginatedResult } from '@/src/shared/domain/pagination';
import { Result } from '@/src/shared/domain/result';
import { BadRequestError, DomainError, ForbiddenError, NotFoundError } from '@/src/shared/domain/errors';

export class ListSupplyMovementsUseCase {
  constructor(
    private readonly movementRepository: ISupplyMovementRepository,
    private readonly supplyRepository: ISupplyRepository
  ) {}

  public async executeForSupply(
    supplyId: string,
    businessId: string,
    filter?: SupplyMovementFilter
  ): Promise<Result<PaginatedResult<SupplyMovement>, DomainError>> {
    try {
      const supply = await this.supplyRepository.findById(supplyId);
      if (!supply) {
        return Result.fail(new NotFoundError('Insumo o útil', supplyId));
      }

      if (supply.businessId !== businessId) {
        return Result.fail(new ForbiddenError('No tienes permisos para ver movimientos de otro negocio.'));
      }

      const result = await this.movementRepository.findBySupplyId(supplyId, filter);
      return Result.ok(result);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }

  public async executeForBusiness(
    businessId: string,
    filter?: SupplyMovementFilter
  ): Promise<Result<PaginatedResult<SupplyMovement>, DomainError>> {
    try {
      if (!businessId || businessId.trim().length === 0) {
        return Result.fail(new BadRequestError('El ID del negocio (businessId) es obligatorio para consultar los movimientos.'));
      }

      const result = await this.movementRepository.findByBusinessId(businessId, filter);
      return Result.ok(result);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
