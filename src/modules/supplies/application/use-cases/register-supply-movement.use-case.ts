import { ISupplyRepository } from '../../domain/repositories/supply.repository.interface';
import { ISupplyMovementRepository } from '../../domain/repositories/supply-movement.repository.interface';
import { RegisterSupplyMovementDTO } from '../dtos/supply-movement.dto';
import { Supply } from '../../domain/entities/supply.entity';
import { SupplyMovement } from '../../domain/entities/supply-movement.entity';
import { Result } from '@/src/shared/domain/result';
import { DomainError, ForbiddenError, NotFoundError } from '@/src/shared/domain/errors';

export interface RegisterMovementOutput {
  movement: SupplyMovement;
  supply: Supply;
}

export class RegisterSupplyMovementUseCase {
  constructor(
    private readonly supplyRepository: ISupplyRepository,
    private readonly movementRepository: ISupplyMovementRepository
  ) {}

  public async execute(
    dto: RegisterSupplyMovementDTO,
    actor: { id: string; role: string }
  ): Promise<Result<RegisterMovementOutput, DomainError>> {
    try {
      const supply = await this.supplyRepository.findById(dto.supplyId);
      if (!supply) {
        return Result.fail(new NotFoundError('Insumo o útil', dto.supplyId));
      }

      if (supply.businessId !== dto.businessId) {
        return Result.fail(new ForbiddenError('No tienes permisos para registrar movimientos en insumos de otro negocio.'));
      }

      const previousStock = supply.currentStock;
      const unitCost = dto.unitCost > 0 ? dto.unitCost : supply.costPerUnit;

      switch (dto.movementType) {
        case 'PURCHASE':
          supply.increaseStock(dto.quantity, dto.unitCost > 0 ? dto.unitCost : undefined);
          break;

        case 'CONSUMPTION':
        case 'WASTE':
          supply.decreaseStock(dto.quantity);
          break;

        case 'ADJUSTMENT':
          supply.adjustStock(dto.quantity);
          break;
      }

      const newStock = supply.currentStock;
      const totalCost = Number((dto.quantity * unitCost).toFixed(2));

      // Persistir actualización de stock del insumo
      const updatedSupply = await this.supplyRepository.update(supply);

      // Crear y persistir el registro del movimiento de kardex
      const movement = SupplyMovement.create({
        businessId: dto.businessId,
        supplyId: dto.supplyId,
        movementType: dto.movementType,
        quantity: dto.quantity,
        previousStock,
        newStock,
        unitCost,
        totalCost,
        reason: dto.reason,
        invoiceNumber: dto.invoiceNumber,
        workerId: dto.workerId,
        createdById: actor.id,
        createdByRole: actor.role,
      });

      const savedMovement = await this.movementRepository.save(movement);

      return Result.ok({
        movement: savedMovement,
        supply: updatedSupply,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }
}
