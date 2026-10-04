import { BadRequestError } from '@/src/shared/domain/errors';

export interface WorkerProps {
  id?: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  passwordHash?: string | null;
  role?: string;
  phone: string;
  specialty?: string | null;
  commissionPercentage?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Worker {
  private readonly _id?: string;
  private readonly _businessId: string;
  private _firstName: string;
  private _lastName: string;
  private _email?: string | null;
  private _passwordHash?: string | null;
  private _role: string;
  private _phone: string;
  private _specialty?: string | null;
  private _commissionPercentage: number;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  private constructor(props: WorkerProps) {
    this._id = props.id;
    this._businessId = props.businessId;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email ?? null;
    this._passwordHash = props.passwordHash ?? null;
    this._role = props.role ?? 'WORKER';
    this._phone = props.phone;
    this._specialty = props.specialty ?? null;
    this._commissionPercentage = props.commissionPercentage ?? 0;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: WorkerProps): Worker {
    if (!props.businessId) {
      throw new BadRequestError('La trabajadora debe estar asociada a un negocio (businessId).');
    }
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new BadRequestError('El nombre de la trabajadora es obligatorio.');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new BadRequestError('El apellido de la trabajadora es obligatorio.');
    }
    if (!props.phone || props.phone.trim().length === 0) {
      throw new BadRequestError('El teléfono de la trabajadora es obligatorio.');
    }
    if (props.commissionPercentage !== undefined && (props.commissionPercentage < 0 || props.commissionPercentage > 100)) {
      throw new BadRequestError('El porcentaje de comisión debe estar entre 0 y 100.');
    }
    return new Worker(props);
  }

  public get id(): string | undefined {
    return this._id;
  }
  public get businessId(): string {
    return this._businessId;
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
  public get passwordHash(): string | null | undefined {
    return this._passwordHash;
  }
  public get role(): string {
    return this._role;
  }
  public get phone(): string {
    return this._phone;
  }
  public get specialty(): string | null | undefined {
    return this._specialty;
  }
  public get commissionPercentage(): number {
    return this._commissionPercentage;
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

  public update(props: Partial<Omit<WorkerProps, 'id' | 'businessId' | 'createdAt'>>): void {
    if (props.firstName !== undefined) {
      if (!props.firstName || props.firstName.trim().length === 0) {
        throw new BadRequestError('El nombre de la trabajadora no puede estar vacío.');
      }
      this._firstName = props.firstName;
    }
    if (props.lastName !== undefined) {
      if (!props.lastName || props.lastName.trim().length === 0) {
        throw new BadRequestError('El apellido de la trabajadora no puede estar vacío.');
      }
      this._lastName = props.lastName;
    }
    if (props.email !== undefined) this._email = props.email;
    if (props.passwordHash !== undefined) this._passwordHash = props.passwordHash;
    if (props.role !== undefined) this._role = props.role;
    if (props.phone !== undefined) {
      if (!props.phone || props.phone.trim().length === 0) {
        throw new BadRequestError('El teléfono de la trabajadora no puede estar vacío.');
      }
      this._phone = props.phone;
    }
    if (props.specialty !== undefined) this._specialty = props.specialty;
    if (props.commissionPercentage !== undefined) {
      if (props.commissionPercentage < 0 || props.commissionPercentage > 100) {
        throw new BadRequestError('El porcentaje de comisión debe estar entre 0 y 100.');
      }
      this._commissionPercentage = props.commissionPercentage;
    }
    if (props.isActive !== undefined) this._isActive = props.isActive;
    this._updatedAt = new Date();
  }
}
