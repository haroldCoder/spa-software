import { BadRequestError } from '@/src/shared/domain/errors';

export interface ClientProps {
  id?: string;
  businessId: string;
  primaryWorkerId?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  identificationNumber?: string | null;
  birthDate?: string | null;
  notes?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client {
  private readonly _id?: string;
  private readonly _businessId: string;
  private _primaryWorkerId?: string | null;
  private _firstName: string;
  private _lastName: string;
  private _email?: string | null;
  private _phone: string;
  private _identificationNumber?: string | null;
  private _birthDate?: string | null;
  private _notes?: string | null;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  private constructor(props: ClientProps) {
    this._id = props.id;
    this._businessId = props.businessId;
    this._primaryWorkerId = props.primaryWorkerId ?? null;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email ?? null;
    this._phone = props.phone;
    this._identificationNumber = props.identificationNumber ?? null;
    this._birthDate = props.birthDate ?? null;
    this._notes = props.notes ?? null;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: ClientProps): Client {
    if (!props.businessId) {
      throw new BadRequestError('El cliente debe estar vinculado a un negocio (businessId).');
    }
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new BadRequestError('El nombre del cliente es obligatorio.');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new BadRequestError('El apellido del cliente es obligatorio.');
    }
    if (!props.phone || props.phone.trim().length === 0) {
      throw new BadRequestError('El teléfono del cliente es obligatorio.');
    }
    return new Client(props);
  }

  public get id(): string | undefined {
    return this._id;
  }
  public get businessId(): string {
    return this._businessId;
  }
  public get primaryWorkerId(): string | null | undefined {
    return this._primaryWorkerId;
  }
  public get firstName(): string {
    return this._firstName;
  }
  public get lastName(): string {
    return this._lastName;
  }
  public get fullName(): string {
    return `${this._firstName} ${this._lastName}`.trim();
  }
  public get email(): string | null | undefined {
    return this._email;
  }
  public get phone(): string {
    return this._phone;
  }
  public get identificationNumber(): string | null | undefined {
    return this._identificationNumber;
  }
  public get birthDate(): string | null | undefined {
    return this._birthDate;
  }
  public get notes(): string | null | undefined {
    return this._notes;
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

  public assignWorker(workerId: string | null): void {
    this._primaryWorkerId = workerId;
    this._updatedAt = new Date();
  }

  public update(props: Partial<Omit<ClientProps, 'id' | 'businessId' | 'createdAt'>>): void {
    if (props.firstName !== undefined) {
      if (!props.firstName || props.firstName.trim().length === 0) {
        throw new BadRequestError('El nombre del cliente no puede estar vacío.');
      }
      this._firstName = props.firstName;
    }
    if (props.lastName !== undefined) {
      if (!props.lastName || props.lastName.trim().length === 0) {
        throw new BadRequestError('El apellido del cliente no puede estar vacío.');
      }
      this._lastName = props.lastName;
    }
    if (props.primaryWorkerId !== undefined) this._primaryWorkerId = props.primaryWorkerId;
    if (props.email !== undefined) this._email = props.email;
    if (props.phone !== undefined) {
      if (!props.phone || props.phone.trim().length === 0) {
        throw new BadRequestError('El teléfono del cliente no puede estar vacío.');
      }
      this._phone = props.phone;
    }
    if (props.identificationNumber !== undefined) this._identificationNumber = props.identificationNumber;
    if (props.birthDate !== undefined) this._birthDate = props.birthDate;
    if (props.notes !== undefined) this._notes = props.notes;
    if (props.isActive !== undefined) this._isActive = props.isActive;
    this._updatedAt = new Date();
  }
}
