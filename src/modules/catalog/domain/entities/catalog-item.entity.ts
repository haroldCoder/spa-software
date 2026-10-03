import { BadRequestError } from '@/src/shared/domain/errors';

export type CatalogItemType = 'SERVICE' | 'PRODUCT';

export interface CatalogItemProps {
  id?: string;
  businessId: string;
  name: string;
  description?: string | null;
  itemType: CatalogItemType;
  category?: string | null;
  price: number;
  cost?: number;
  durationMinutes?: number | null; // For services
  stockQuantity?: number | null;   // For products
  sku?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CatalogItem {
  private readonly _id?: string;
  private readonly _businessId: string;
  private _name: string;
  private _description?: string | null;
  private _itemType: CatalogItemType;
  private _category?: string | null;
  private _price: number;
  private _cost: number;
  private _durationMinutes?: number | null;
  private _stockQuantity?: number | null;
  private _sku?: string | null;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  private constructor(props: CatalogItemProps) {
    this._id = props.id;
    this._businessId = props.businessId;
    this._name = props.name;
    this._description = props.description ?? null;
    this._itemType = props.itemType;
    this._category = props.category ?? null;
    this._price = props.price;
    this._cost = props.cost ?? 0;
    this._durationMinutes = props.durationMinutes ?? null;
    this._stockQuantity = props.stockQuantity ?? null;
    this._sku = props.sku ?? null;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CatalogItemProps): CatalogItem {
    if (!props.businessId) {
      throw new BadRequestError('El artículo del catálogo debe pertenecer a un negocio (businessId).');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new BadRequestError('El nombre del producto o servicio es obligatorio.');
    }
    if (props.price < 0) {
      throw new BadRequestError('El precio no puede ser negativo.');
    }
    if (props.itemType === 'SERVICE' && props.durationMinutes !== undefined && props.durationMinutes !== null && props.durationMinutes <= 0) {
      throw new BadRequestError('La duración del servicio debe ser mayor a 0 minutos.');
    }
    if (props.itemType === 'PRODUCT' && props.stockQuantity !== undefined && props.stockQuantity !== null && props.stockQuantity < 0) {
      throw new BadRequestError('El stock no puede ser negativo.');
    }

    return new CatalogItem(props);
  }

  public get id(): string | undefined {
    return this._id;
  }
  public get businessId(): string {
    return this._businessId;
  }
  public get name(): string {
    return this._name;
  }
  public get description(): string | null | undefined {
    return this._description;
  }
  public get itemType(): CatalogItemType {
    return this._itemType;
  }
  public get category(): string | null | undefined {
    return this._category;
  }
  public get price(): number {
    return this._price;
  }
  public get cost(): number {
    return this._cost;
  }
  public get durationMinutes(): number | null | undefined {
    return this._durationMinutes;
  }
  public get stockQuantity(): number | null | undefined {
    return this._stockQuantity;
  }
  public get sku(): string | null | undefined {
    return this._sku;
  }
  public get isActive(): boolean {
    return this._isActive;
  }
  public get createdAt(): Date | undefined {
    return this._createdAt;
  }
  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  public isService(): boolean {
    return this._itemType === 'SERVICE';
  }

  public isProduct(): boolean {
    return this._itemType === 'PRODUCT';
  }

  public update(props: Partial<Omit<CatalogItemProps, 'id' | 'businessId' | 'createdAt'>>): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0) {
        throw new BadRequestError('El nombre del producto o servicio no puede estar vacío.');
      }
      this._name = props.name;
    }
    if (props.description !== undefined) this._description = props.description;
    if (props.itemType !== undefined) this._itemType = props.itemType;
    if (props.category !== undefined) this._category = props.category;
    if (props.price !== undefined) {
      if (props.price < 0) throw new BadRequestError('El precio no puede ser negativo.');
      this._price = props.price;
    }
    if (props.cost !== undefined) {
      if (props.cost < 0) throw new BadRequestError('El costo no puede ser negativo.');
      this._cost = props.cost;
    }
    if (props.durationMinutes !== undefined) {
      if (props.durationMinutes !== null && props.durationMinutes <= 0) {
        throw new BadRequestError('La duración del servicio debe ser mayor a 0 minutos.');
      }
      this._durationMinutes = props.durationMinutes;
    }
    if (props.stockQuantity !== undefined) {
      if (props.stockQuantity !== null && props.stockQuantity < 0) {
        throw new BadRequestError('El stock no puede ser negativo.');
      }
      this._stockQuantity = props.stockQuantity;
    }
    if (props.sku !== undefined) this._sku = props.sku;
    if (props.isActive !== undefined) this._isActive = props.isActive;
    this._updatedAt = new Date();
  }
}
