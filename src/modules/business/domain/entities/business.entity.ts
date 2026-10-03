import { BadRequestError } from '@/src/shared/domain/errors';

export interface BusinessProps {
  id?: string;
  name: string;
  legalName?: string | null;
  taxId?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string;
  currency?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Business {
  private readonly _id?: string;
  private _name: string;
  private _legalName?: string | null;
  private _taxId?: string | null;
  private _email: string;
  private _phone?: string | null;
  private _address?: string | null;
  private _city?: string | null;
  private _country: string;
  private _currency: string;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  private constructor(props: BusinessProps) {
    this._id = props.id;
    this._name = props.name;
    this._legalName = props.legalName ?? null;
    this._taxId = props.taxId ?? null;
    this._email = props.email;
    this._phone = props.phone ?? null;
    this._address = props.address ?? null;
    this._city = props.city ?? null;
    this._country = props.country ?? 'CO';
    this._currency = props.currency ?? 'COP';
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: BusinessProps): Business {
    if (!props.name || props.name.trim().length === 0) {
      throw new BadRequestError('El nombre del negocio o spa es obligatorio.');
    }
    if (!props.email || !props.email.includes('@')) {
      throw new BadRequestError('Debe proporcionar un email válido para el negocio.');
    }
    return new Business(props);
  }

  public get id(): string | undefined {
    return this._id;
  }
  public get name(): string {
    return this._name;
  }
  public get legalName(): string | null | undefined {
    return this._legalName;
  }
  public get taxId(): string | null | undefined {
    return this._taxId;
  }
  public get email(): string {
    return this._email;
  }
  public get phone(): string | null | undefined {
    return this._phone;
  }
  public get address(): string | null | undefined {
    return this._address;
  }
  public get city(): string | null | undefined {
    return this._city;
  }
  public get country(): string {
    return this._country;
  }
  public get currency(): string {
    return this._currency;
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

  public update(props: Partial<Omit<BusinessProps, 'id' | 'createdAt'>>): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0) {
        throw new BadRequestError('El nombre del negocio no puede estar vacío.');
      }
      this._name = props.name;
    }
    if (props.legalName !== undefined) this._legalName = props.legalName;
    if (props.taxId !== undefined) this._taxId = props.taxId;
    if (props.email !== undefined) {
      if (!props.email || !props.email.includes('@')) {
        throw new BadRequestError('Debe proporcionar un email válido para el negocio.');
      }
      this._email = props.email;
    }
    if (props.phone !== undefined) this._phone = props.phone;
    if (props.address !== undefined) this._address = props.address;
    if (props.city !== undefined) this._city = props.city;
    if (props.country !== undefined) this._country = props.country;
    if (props.currency !== undefined) this._currency = props.currency;
    if (props.isActive !== undefined) this._isActive = props.isActive;
    this._updatedAt = new Date();
  }
}
