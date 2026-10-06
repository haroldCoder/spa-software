import { BadRequestError, ConflictError } from '@/src/shared/domain/errors';
import { Appointment } from '../entities/appointment.entity';
import { CatalogItem } from '@/src/modules/catalog/domain/entities/catalog-item.entity';

export interface RescheduleTimeResult {
  scheduledAt: Date;
  durationMinutes: number;
  endTime: Date;
}

export class AppointmentUpdatePolicy {
  /**
   * Valida si el estado actual de la cita permite que sea modificada o reprogramada.
   * Citas completadas o canceladas no pueden alterarse.
   */
  public static validateCanModify(appointment: Appointment): void {
    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      throw new BadRequestError(
        `No se puede modificar ni reprogramar una cita en estado '${appointment.status}'.`
      );
    }
  }

  /**
   * Valida que la nueva trabajadora asignada pertenezca al mismo negocio de la cita.
   */
  public static validateWorkerReassignment(workerBusinessId: string, appointmentBusinessId: string): void {
    if (workerBusinessId !== appointmentBusinessId) {
      throw new BadRequestError('La trabajadora seleccionada no pertenece a este negocio.');
    }
  }

  /**
   * Valida que el nuevo servicio del catálogo pertenezca al mismo negocio de la cita.
   */
  public static validateServiceChange(serviceBusinessId: string, appointmentBusinessId: string): void {
    if (serviceBusinessId !== appointmentBusinessId) {
      throw new BadRequestError('El servicio seleccionado no pertenece al catálogo de este negocio.');
    }
  }

  /**
   * Resuelve el nuevo horario y duración calculando la fecha de fin de la cita reprogramada.
   */
  public static resolveRescheduleTime(
    currentScheduledAt: Date,
    currentDurationMinutes: number,
    newScheduledAtStr?: string,
    newDurationMinutes?: number
  ): RescheduleTimeResult {
    const scheduledAt = newScheduledAtStr ? new Date(newScheduledAtStr) : currentScheduledAt;
    if (isNaN(scheduledAt.getTime())) {
      throw new BadRequestError('La nueva fecha y hora de la cita es inválida.');
    }

    const durationMinutes = newDurationMinutes ?? currentDurationMinutes;
    if (durationMinutes <= 0) {
      throw new BadRequestError('La duración de la cita debe ser mayor a 0 minutos.');
    }

    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

    return {
      scheduledAt,
      durationMinutes,
      endTime,
    };
  }

  /**
   * Resuelve el precio y la duración cuando se cambia o se remueve el servicio del catálogo.
   */
  public static resolveServiceUpdate(
    service: CatalogItem | null,
    customPrice?: number,
    customDuration?: number
  ): { price: number | undefined; durationMinutes: number | undefined } {
    if (service) {
      return {
        price: customPrice ?? service.price,
        durationMinutes: customDuration ?? service.durationMinutes ?? undefined,
      };
    }

    return {
      price: customPrice,
      durationMinutes: customDuration,
    };
  }

  /**
   * Valida que la reprogramación o cambio de trabajadora no genere conflictos de horario.
   */
  public static validateNoScheduleConflict(overlappingAppointments: Appointment[]): void {
    if (overlappingAppointments.length > 0) {
      throw new ConflictError(
        'La trabajadora ya cuenta con una cita activa o reservada en el nuevo horario seleccionado.'
      );
    }
  }
}
