import { BadRequestError, NotFoundError } from '@/src/shared/domain/errors';

export class SupplyNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Insumo o útil', id);
  }
}

export class InsufficientStockError extends BadRequestError {
  constructor(supplyName: string, available: number, requested: number) {
    super(
      `Stock insuficiente para el insumo "${supplyName}". Disponible: ${available}, solicitado: ${requested}.`
    );
  }
}
