import { BadRequestError } from '@/src/shared/domain/errors';

export enum SupplyItemType {
  CONSUMABLE = 'CONSUMABLE',
  DISPOSABLE = 'DISPOSABLE',
  TOOL_UTILITY = 'TOOL_UTILITY',
  CLEANING_HYGIENE = 'CLEANING_HYGIENE',
}

export enum SupplyUnitMeasure {
  UNIT = 'UNIT',
  ML = 'ML',
  L = 'L',
  GR = 'GR',
  KG = 'KG',
  PACK = 'PACK',
  BOX = 'BOX',
  ROLL = 'ROLL',
}

export interface SupplyProps {
  id?: string;
  businessId: string;
  name: string;
  description?: string | null;
  itemType: SupplyItemType;
  category?: string | null;
  unitMeasure: SupplyUnitMeasure;
  currentStock: number;
  minStockAlert: number;
  costPerUnit: number;
  sku?: string | null;
  supplierName?: string | null;
  supplierContact?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Supply {
  private readonly _id?: string;
  private readonly _businessId: string;
  private _name: string;
  private _description?: string | null;
  private _itemType: SupplyItemType;
  private _category?: string | null;
  private _unitMeasure: SupplyUnitMeasure;
  private _currentStock: number;
  private _minStockAlert: number;
  private _costPerUnit: number;
  private _sku?: string | null;
  private _supplierName?: string | null;
  private _supplierContact?: string | null;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  private constructor(props: SupplyProps) {
    this._id = props.id;
    this._businessId = props.businessId;
    this._name = props.name;
    this._description = props.description ?? null;
    this._itemType = props.itemType;
    this._category = props.category ?? null;
    this._unitMeasure = props.unitMeasure;
    this._currentStock = props.currentStock;
    this._minStockAlert = props.minStockAlert;
    this._costPerUnit = props.costPerUnit;
    this._sku = props.sku ?? null;
    this._supplierName = props.supplierName ?? null;
    this._supplierContact = props.supplierContact ?? null;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: SupplyProps): Supply {
    if (!props.businessId) {
      throw new BadRequestError('El insumo o útil debe pertenecer obligatoriamente a un negocio (businessId).');
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new BadRequestError('El nombre del insumo o útil es obligatorio.');
    }

    if (props.currentStock < 0) {
      throw new BadRequestError('El stock inicial no puede ser un número negativo.');
    }

    if (props.minStockAlert < 0) {
      throw new BadRequestError('El umbral de alerta de stock mínimo no puede ser negativo.');
    }

    if (props.costPerUnit < 0) {
      throw new BadRequestError('El costo unitario no puede ser negativo.');
    }

    return new Supply({
      ...props,
      name: props.name.trim(),
      description: props.description?.trim() ?? null,
      category: props.category?.trim() ?? null,
      sku: props.sku?.trim() ?? null,
      supplierName: props.supplierName?.trim() ?? null,
      supplierContact: props.supplierContact?.trim() ?? null,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  public updateDetails(updates: {
    name?: string;
    description?: string | null;
    itemType?: SupplyItemType;
    category?: string | null;
    unitMeasure?: SupplyUnitMeasure;
    minStockAlert?: number;
    costPerUnit?: number;
    sku?: string | null;
    supplierName?: string | null;
    supplierContact?: string | null;
    isActive?: boolean;
  }): void {
    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        throw new BadRequestError('El nombre del insumo o útil no puede estar vacío.');
      }
      this._name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      this._description = updates.description?.trim() ?? null;
    }

    if (updates.itemType !== undefined) {
      this._itemType = updates.itemType;
    }

    if (updates.category !== undefined) {
      this._category = updates.category?.trim() ?? null;
    }

    if (updates.unitMeasure !== undefined) {
      this._unitMeasure = updates.unitMeasure;
    }

    if (updates.minStockAlert !== undefined) {
      if (updates.minStockAlert < 0) {
        throw new BadRequestError('El umbral de stock mínimo no puede ser negativo.');
      }
      this._minStockAlert = updates.minStockAlert;
    }

    if (updates.costPerUnit !== undefined) {
      if (updates.costPerUnit < 0) {
        throw new BadRequestError('El costo unitario no puede ser negativo.');
      }
      this._costPerUnit = updates.costPerUnit;
    }

    if (updates.sku !== undefined) {
      this._sku = updates.sku?.trim() ?? null;
    }

    if (updates.supplierName !== undefined) {
      this._supplierName = updates.supplierName?.trim() ?? null;
    }

    if (updates.supplierContact !== undefined) {
      this._supplierContact = updates.supplierContact?.trim() ?? null;
    }

    if (updates.isActive !== undefined) {
      this._isActive = updates.isActive;
    }

    this._updatedAt = new Date();
  }

  public adjustStock(newStock: number): void {
    if (newStock < 0) {
      throw new BadRequestError('El stock final ajustado no puede ser un valor negativo.');
    }
    this._currentStock = newStock;
    this._updatedAt = new Date();
  }

  public increaseStock(quantity: number, newCostPerUnit?: number): void {
    if (quantity <= 0) {
      throw new BadRequestError('La cantidad a ingresar debe ser mayor a cero.');
    }
    this._currentStock += quantity;
    if (newCostPerUnit !== undefined && newCostPerUnit >= 0) {
      this._costPerUnit = newCostPerUnit;
    }
    this._updatedAt = new Date();
  }

  public decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new BadRequestError('La cantidad a descontar debe ser mayor a cero.');
    }
    if (this._currentStock < quantity) {
      throw new BadRequestError(
        `Stock insuficiente para el insumo "${this._name}". Stock disponible: ${this._currentStock}, cantidad requerida: ${quantity}.`
      );
    }
    this._currentStock -= quantity;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  public isLowStock(): boolean {
    return this._currentStock <= this._minStockAlert;
  }

  public get totalStockValue(): number {
    return this._currentStock * this._costPerUnit;
  }

  // Getters
  public get id(): string | undefined { return this._id; }
  public get businessId(): string { return this._businessId; }
  public get name(): string { return this._name; }
  public get description(): string | null | undefined { return this._description; }
  public get itemType(): SupplyItemType { return this._itemType; }
  public get category(): string | null | undefined { return this._category; }
  public get unitMeasure(): SupplyUnitMeasure { return this._unitMeasure; }
  public get currentStock(): number { return this._currentStock; }
  public get minStockAlert(): number { return this._minStockAlert; }
  public get costPerUnit(): number { return this._costPerUnit; }
  public get sku(): string | null | undefined { return this._sku; }
  public get supplierName(): string | null | undefined { return this._supplierName; }
  public get supplierContact(): string | null | undefined { return this._supplierContact; }
  public get isActive(): boolean { return this._isActive; }
  public get createdAt(): Date | undefined { return this._createdAt; }
  public get updatedAt(): Date | undefined { return this._updatedAt; }
}
