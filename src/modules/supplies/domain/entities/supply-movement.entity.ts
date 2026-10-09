import { BadRequestError } from '@/src/shared/domain/errors';

export type SupplyMovementType = 'PURCHASE' | 'CONSUMPTION' | 'WASTE' | 'ADJUSTMENT';

export interface SupplyMovementProps {
  id?: string;
  businessId: string;
  supplyId: string;
  movementType: SupplyMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalCost: number;
  reason?: string | null;
  invoiceNumber?: string | null;
  workerId?: string | null;
  createdById: string;
  createdByRole: string;
  createdAt?: Date;
}

export class SupplyMovement {
  private readonly _id?: string;
  private readonly _businessId: string;
  private readonly _supplyId: string;
  private readonly _movementType: SupplyMovementType;
  private readonly _quantity: number;
  private readonly _previousStock: number;
  private readonly _newStock: number;
  private readonly _unitCost: number;
  private readonly _totalCost: number;
  private readonly _reason?: string | null;
  private readonly _invoiceNumber?: string | null;
  private readonly _workerId?: string | null;
  private readonly _createdById: string;
  private readonly _createdByRole: string;
  private readonly _createdAt?: Date;

  private constructor(props: SupplyMovementProps) {
    this._id = props.id;
    this._businessId = props.businessId;
    this._supplyId = props.supplyId;
    this._movementType = props.movementType;
    this._quantity = props.quantity;
    this._previousStock = props.previousStock;
    this._newStock = props.newStock;
    this._unitCost = props.unitCost;
    this._totalCost = props.totalCost;
    this._reason = props.reason ?? null;
    this._invoiceNumber = props.invoiceNumber ?? null;
    this._workerId = props.workerId ?? null;
    this._createdById = props.createdById;
    this._createdByRole = props.createdByRole;
    this._createdAt = props.createdAt ?? new Date();
  }

  public static create(props: SupplyMovementProps): SupplyMovement {
    if (!props.businessId) {
      throw new BadRequestError('El movimiento debe estar asociado obligatoriamente a un negocio (businessId).');
    }

    if (!props.supplyId) {
      throw new BadRequestError('El movimiento debe estar asociado a un insumo (supplyId).');
    }

    if (props.quantity <= 0) {
      throw new BadRequestError('La cantidad del movimiento debe ser estrictamente mayor a 0.');
    }

    if (props.newStock < 0) {
      throw new BadRequestError('El nuevo saldo de stock no puede ser negativo.');
    }

    if (!props.createdById) {
      throw new BadRequestError('Se requiere el identificador del usuario que registra el movimiento.');
    }

    const calculatedTotal = props.totalCost > 0 ? props.totalCost : Number((props.quantity * props.unitCost).toFixed(2));

    return new SupplyMovement({
      ...props,
      totalCost: calculatedTotal,
      reason: props.reason?.trim() ?? null,
      invoiceNumber: props.invoiceNumber?.trim() ?? null,
      workerId: props.workerId ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  // Getters
  public get id(): string | undefined { return this._id; }
  public get businessId(): string { return this._businessId; }
  public get supplyId(): string { return this._supplyId; }
  public get movementType(): SupplyMovementType { return this._movementType; }
  public get quantity(): number { return this._quantity; }
  public get previousStock(): number { return this._previousStock; }
  public get newStock(): number { return this._newStock; }
  public get unitCost(): number { return this._unitCost; }
  public get totalCost(): number { return this._totalCost; }
  public get reason(): string | null | undefined { return this._reason; }
  public get invoiceNumber(): string | null | undefined { return this._invoiceNumber; }
  public get workerId(): string | null | undefined { return this._workerId; }
  public get createdById(): string { return this._createdById; }
  public get createdByRole(): string { return this._createdByRole; }
  public get createdAt(): Date | undefined { return this._createdAt; }
}
