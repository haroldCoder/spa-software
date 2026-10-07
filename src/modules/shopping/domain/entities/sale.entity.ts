import { BadRequestError } from '@/src/shared/domain/errors';
import { SaleItem } from './sale-item.entity';

export interface SaleProps {
  id?: string;
  businessId: string;
  clientId: string;
  workerId?: string | null;
  totalAmount?: number;
  serviceAmount?: number;
  productAmount?: number;
  createdById?: string | null;
  createdByRole?: string | null;
  items?: SaleItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Sale {
  private readonly _id?: string;
  private readonly _businessId: string;
  private readonly _clientId: string;
  private _workerId: string | null;
  private _totalAmount: number;
  private _serviceAmount: number;
  private _productAmount: number;
  private readonly _createdById: string | null;
  private readonly _createdByRole: string | null;
  private _items: SaleItem[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: SaleProps) {
    this._id = props.id;
    this._businessId = props.businessId;
    this._clientId = props.clientId;
    this._workerId = props.workerId ?? null;
    this._items = props.items ?? [];
    this._createdById = props.createdById ?? null;
    this._createdByRole = props.createdByRole ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();

    const totals = this.calculateTotalsFromItems(this._items, {
      totalAmount: props.totalAmount,
      serviceAmount: props.serviceAmount,
      productAmount: props.productAmount,
    });
    this._totalAmount = totals.totalAmount;
    this._serviceAmount = totals.serviceAmount;
    this._productAmount = totals.productAmount;
  }

  public static create(props: SaleProps): Sale {
    if (!props.businessId) {
      throw new BadRequestError('El ID del negocio (businessId) es obligatorio para la venta.');
    }
    if (!props.clientId) {
      throw new BadRequestError('El ID del cliente (clientId) es obligatorio para la venta.');
    }

    const items = props.items ?? [];
    if (items.length === 0 && (!props.totalAmount || props.totalAmount <= 0)) {
      throw new BadRequestError('La venta debe contener al menos un producto o servicio o un valor total mayor a 0.');
    }

    return new Sale({
      ...props,
      items,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  private calculateTotalsFromItems(
    items: SaleItem[],
    overrides?: { totalAmount?: number; serviceAmount?: number; productAmount?: number }
  ): { totalAmount: number; serviceAmount: number; productAmount: number } {
    if (items.length === 0) {
      const totalAmount = overrides?.totalAmount ?? 0;
      const serviceAmount = overrides?.serviceAmount ?? 0;
      const productAmount = overrides?.productAmount ?? 0;
      return { totalAmount, serviceAmount, productAmount };
    }

    let serviceTotal = 0;
    let productTotal = 0;

    for (const item of items) {
      if (item.isService()) {
        serviceTotal += item.subtotal;
      } else {
        productTotal += item.subtotal;
      }
    }

    const total = serviceTotal + productTotal;
    return {
      totalAmount: Number(total.toFixed(2)),
      serviceAmount: Number(serviceTotal.toFixed(2)),
      productAmount: Number(productTotal.toFixed(2)),
    };
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get businessId(): string {
    return this._businessId;
  }

  public get clientId(): string {
    return this._clientId;
  }

  public get workerId(): string | null {
    return this._workerId;
  }

  public setWorkerId(workerId: string | null): void {
    this._workerId = workerId;
    this._updatedAt = new Date();
  }

  public get totalAmount(): number {
    return this._totalAmount;
  }

  public get serviceAmount(): number {
    return this._serviceAmount;
  }

  public get productAmount(): number {
    return this._productAmount;
  }

  public get createdById(): string | null {
    return this._createdById;
  }

  public get createdByRole(): string | null {
    return this._createdByRole;
  }

  public get items(): SaleItem[] {
    return [...this._items];
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public addItem(item: SaleItem): void {
    this._items.push(item);
    const totals = this.calculateTotalsFromItems(this._items);
    this._totalAmount = totals.totalAmount;
    this._serviceAmount = totals.serviceAmount;
    this._productAmount = totals.productAmount;
    this._updatedAt = new Date();
  }
}
