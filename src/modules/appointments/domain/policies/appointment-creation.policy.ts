import { BadRequestError, ConflictError } from '@/src/shared/domain/errors';
import { Appointment } from '../entities/appointment.entity';
import { CatalogItem } from '@/src/modules/catalog/domain/entities/catalog-item.entity';

export interface ResolveTimingAndPricingParams {
  scheduledAt: string | Date;
  durationMinutes?: number;
  price?: number;
  service?: CatalogItem | null;
}

export interface TimingAndPricingResult {
  scheduledAt: Date;
  durationMinutes: number;
  endTime: Date;
  price: number;
}

export class AppointmentCreationPolicy {
  /**
   * Valida que el cliente pertenezca a la misma organización o Spa.
   */
  public static validateClientBelongsToBusiness(clientBusinessId: string, targetBusinessId: string): void {
    if (clientBusinessId !== targetBusinessId) {
      throw new BadRequestError('El cliente seleccionado no pertenece al negocio indicado.');
    }
  }

  /**
   * Valida que la trabajadora pertenezca a la misma organización o Spa.
   */
  public static validateWorkerBelongsToBusiness(workerBusinessId: string, targetBusinessId: string): void {
    if (workerBusinessId !== targetBusinessId) {
      throw new BadRequestError('La trabajadora seleccionada no pertenece a este negocio.');
    }
  }

  /**
   * Valida que el servicio del catálogo pertenezca a la misma organización o Spa.
   */
  public static validateServiceBelongsToBusiness(serviceBusinessId: string, targetBusinessId: string): void {
    if (serviceBusinessId !== targetBusinessId) {
      throw new BadRequestError('El servicio seleccionado no pertenece al catálogo de este negocio.');
    }
  }

  /**
   * Valida que no existan citas previas activas en conflicto de horario para la trabajadora.
   */
  public static validateNoScheduleConflict(overlappingAppointments: Appointment[]): void {
    if (overlappingAppointments.length > 0) {
      throw new ConflictError(
        'La trabajadora ya cuenta con una cita activa o reservada en el rango de horario seleccionado.'
      );
    }
  }

  /**
   * Resuelve y calcula la duración, fecha fin y precio final de la cita a partir del servicio o valores personalizados.
   */
  public static resolveTimingAndPricing(params: ResolveTimingAndPricingParams): TimingAndPricingResult {
    let durationMinutes = params.durationMinutes ?? 60;
    let price = params.price ?? 0;

    if (params.service) {
      if (params.durationMinutes === undefined && params.service.durationMinutes) {
        durationMinutes = params.service.durationMinutes;
      }
      if (params.price === undefined) {
        price = params.service.price;
      }
    }

    if (durationMinutes <= 0) {
      throw new BadRequestError('La duración de la cita debe ser mayor a 0 minutos.');
    }

    const scheduledAt = typeof params.scheduledAt === 'string' ? new Date(params.scheduledAt) : params.scheduledAt;
    if (isNaN(scheduledAt.getTime())) {
      throw new BadRequestError('La fecha y hora de la cita es inválida.');
    }

    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

    return {
      scheduledAt,
      durationMinutes,
      endTime,
      price,
    };
  }

  /**
   * Resuelve la asignación de la trabajadora considerando si quien crea la cita es una trabajadora.
   */
  public static resolveWorkerAssignment(
    requestedWorkerId?: string | null,
    actor?: { id: string; role: 'BUSINESS_OWNER' | 'WORKER' }
  ): string | null {
    if (!requestedWorkerId && actor?.role === 'WORKER') {
      return actor.id;
    }
    return requestedWorkerId ?? null;
  }
}
