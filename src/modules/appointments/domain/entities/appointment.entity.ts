import { BadRequestError } from '@/src/shared/domain/errors';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface AppointmentProps {
  id?: string;
  businessId: string;
  workerId?: string | null;
  clientId: string;
  serviceId?: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  endTime: Date;
  status?: AppointmentStatus;
  price: number;
  notes?: string | null;
  cancellationReason?: string | null;
  createdById?: string | null;
  createdByRole?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Appointment {
  private readonly _id?: string;
  private readonly _businessId: string;
  private _workerId: string | null;
  private readonly _clientId: string;
  private _serviceId: string | null;
  private _scheduledAt: Date;
  private _durationMinutes: number;
  private _endTime: Date;
  private _status: AppointmentStatus;
  private _price: number;
  private _notes: string | null;
  private _cancellationReason: string | null;
  private readonly _createdById: string | null;
  private readonly _createdByRole: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: AppointmentProps) {
    this._id = props.id;
    this._businessId = props.businessId;
    this._workerId = props.workerId ?? null;
    this._clientId = props.clientId;
    this._serviceId = props.serviceId ?? null;
    this._scheduledAt = props.scheduledAt;
    this._durationMinutes = props.durationMinutes;
    this._endTime = props.endTime;
    this._status = props.status ?? 'PENDING';
    this._price = props.price;
    this._notes = props.notes ?? null;
    this._cancellationReason = props.cancellationReason ?? null;
    this._createdById = props.createdById ?? null;
    this._createdByRole = props.createdByRole ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: AppointmentProps): Appointment {
    if (!props.businessId) {
      throw new BadRequestError('El ID del negocio (businessId) es obligatorio para la cita.');
    }
    if (!props.clientId) {
      throw new BadRequestError('El ID del cliente (clientId) es obligatorio para la cita.');
    }
    if (!props.scheduledAt || isNaN(props.scheduledAt.getTime())) {
      throw new BadRequestError('La fecha y hora de inicio de la cita es obligatoria.');
    }
    if (props.durationMinutes <= 0) {
      throw new BadRequestError('La duración de la cita debe ser mayor a 0 minutos.');
    }
    if (props.price < 0) {
      throw new BadRequestError('El precio de la cita no puede ser negativo.');
    }

    const calculatedEndTime = props.endTime ?? new Date(props.scheduledAt.getTime() + props.durationMinutes * 60 * 1000);

    return new Appointment({
      ...props,
      endTime: calculatedEndTime,
      status: props.status ?? 'PENDING',
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get businessId(): string {
    return this._businessId;
  }

  public get workerId(): string | null {
    return this._workerId;
  }

  public get clientId(): string {
    return this._clientId;
  }

  public get serviceId(): string | null {
    return this._serviceId;
  }

  public get scheduledAt(): Date {
    return this._scheduledAt;
  }

  public get durationMinutes(): number {
    return this._durationMinutes;
  }

  public get endTime(): Date {
    return this._endTime;
  }

  public get status(): AppointmentStatus {
    return this._status;
  }

  public get price(): number {
    return this._price;
  }

  public get notes(): string | null {
    return this._notes;
  }

  public get cancellationReason(): string | null {
    return this._cancellationReason;
  }

  public get createdById(): string | null {
    return this._createdById;
  }

  public get createdByRole(): string | null {
    return this._createdByRole;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public confirm(): void {
    if (this._status === 'CANCELLED') {
      throw new BadRequestError('No se puede confirmar una cita que ha sido cancelada.');
    }
    if (this._status === 'COMPLETED') {
      throw new BadRequestError('No se puede modificar una cita que ya fue completada.');
    }
    this._status = 'CONFIRMED';
    this._updatedAt = new Date();
  }

  public complete(): void {
    if (this._status === 'CANCELLED') {
      throw new BadRequestError('No se puede marcar como completada una cita cancelada.');
    }
    this._status = 'COMPLETED';
    this._updatedAt = new Date();
  }

  public cancel(reason?: string): void {
    if (this._status === 'COMPLETED') {
      throw new BadRequestError('No se puede cancelar una cita que ya fue completada.');
    }
    this._status = 'CANCELLED';
    this._cancellationReason = reason ?? null;
    this._updatedAt = new Date();
  }

  public markNoShow(): void {
    if (this._status === 'COMPLETED') {
      throw new BadRequestError('No se puede marcar como no asistida una cita ya completada.');
    }
    this._status = 'NO_SHOW';
    this._updatedAt = new Date();
  }

  public reschedule(newScheduledAt: Date, durationMinutes?: number): void {
    if (this._status === 'COMPLETED' || this._status === 'CANCELLED') {
      throw new BadRequestError(`No se puede reprogramar una cita en estado ${this._status}.`);
    }
    if (!newScheduledAt || isNaN(newScheduledAt.getTime())) {
      throw new BadRequestError('La nueva fecha y hora es inválida.');
    }
    const duration = durationMinutes ?? this._durationMinutes;
    if (duration <= 0) {
      throw new BadRequestError('La duración debe ser mayor a 0 minutos.');
    }

    this._scheduledAt = newScheduledAt;
    this._durationMinutes = duration;
    this._endTime = new Date(newScheduledAt.getTime() + duration * 60 * 1000);
    this._updatedAt = new Date();
  }

  public reassignWorker(workerId: string | null): void {
    if (this._status === 'COMPLETED' || this._status === 'CANCELLED') {
      throw new BadRequestError(`No se puede reasignar una cita en estado ${this._status}.`);
    }
    this._workerId = workerId;
    this._updatedAt = new Date();
  }

  public updateService(serviceId: string | null, price?: number, durationMinutes?: number): void {
    this._serviceId = serviceId;
    if (price !== undefined && price >= 0) {
      this._price = price;
    }
    if (durationMinutes !== undefined && durationMinutes > 0) {
      this._durationMinutes = durationMinutes;
      this._endTime = new Date(this._scheduledAt.getTime() + durationMinutes * 60 * 1000);
    }
    this._updatedAt = new Date();
  }

  public updateNotes(notes: string | null): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  public updatePrice(price: number): void {
    if (price < 0) {
      throw new BadRequestError('El precio de la cita no puede ser negativo.');
    }
    this._price = price;
    this._updatedAt = new Date();
  }
}
