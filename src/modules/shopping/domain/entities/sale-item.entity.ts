import { BadRequestError } from '@/src/shared/domain/errors';

export enum SaleItemType {
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
}

export const SALE_ITEM_TYPES = Object.values(SaleItemType) as readonly SaleItemType[];

export interface SaleItemProps {
  id?: string;
  saleId?: string;
  catalogItemId?: string | null;
  itemType: SaleItemType;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  createdAt?: Date;
}

export class SaleItem {
  private readonly _id?: string;
  private _saleId?: string;
  private readonly _catalogItemId: string | null;
  private readonly _itemType: SaleItemType;
  private readonly _itemName: string;
  private readonly _quantity: number;
  private readonly _unitPrice: number;
  private readonly _subtotal: number;
  private readonly _createdAt: Date;

  private constructor(props: SaleItemProps) {
    this._id = props.id;
    this._saleId = props.saleId;
    this._catalogItemId = props.catalogItemId ?? null;
    this._itemType = props.itemType;
    this._itemName = props.itemName.trim();
    this._quantity = props.quantity;
    this._unitPrice = props.unitPrice;
    this._subtotal = props.subtotal ?? props.quantity * props.unitPrice;
    this._createdAt = props.createdAt ?? new Date();
  }

  public static create(props: SaleItemProps): SaleItem {
    if (!props.itemName || !props.itemName.trim()) {
      throw new BadRequestError('El nombre del producto o servicio vendido es obligatorio.');
    }
    if (props.quantity <= 0) {
      throw new BadRequestError('La cantidad vendida debe ser mayor a 0.');
    }
    if (props.unitPrice < 0) {
      throw new BadRequestError('El precio unitario no puede ser negativo.');
    }
    if (props.itemType !== SaleItemType.SERVICE && props.itemType !== SaleItemType.PRODUCT) {
      throw new BadRequestError('El tipo de ítem debe ser SERVICE o PRODUCT.');
    }

    const calculatedSubtotal = Number((props.quantity * props.unitPrice).toFixed(2));

    return new SaleItem({
      ...props,
      subtotal: calculatedSubtotal,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get saleId(): string | undefined {
    return this._saleId;
  }

  public setSaleId(saleId: string): void {
    this._saleId = saleId;
  }

  public get catalogItemId(): string | null {
    return this._catalogItemId;
  }

  public get itemType(): SaleItemType {
    return this._itemType;
  }

  public get itemName(): string {
    return this._itemName;
  }

  public get quantity(): number {
    return this._quantity;
  }

  public get unitPrice(): number {
    return this._unitPrice;
  }

  public get subtotal(): number {
    return this._subtotal;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public isService(): boolean {
    return this._itemType === SaleItemType.SERVICE;
  }

  public isProduct(): boolean {
    return this._itemType === SaleItemType.PRODUCT;
  }
}
