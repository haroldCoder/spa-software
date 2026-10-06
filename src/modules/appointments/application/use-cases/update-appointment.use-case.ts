import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError } from '@/src/shared/domain/errors';
import { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';
import { ICatalogRepository } from '@/src/modules/catalog/domain/repositories/catalog.repository.interface';
import { Appointment } from '../../domain/entities/appointment.entity';
import { AppointmentUpdatePolicy } from '../../domain/policies/appointment-update.policy';
import { UpdateAppointmentDTO } from '../dtos/appointment.dto';

export class UpdateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly workerRepository: IWorkerRepository,
    private readonly catalogRepository: ICatalogRepository
  ) {}

  public async execute(id: string, dto: UpdateAppointmentDTO): Promise<Result<Appointment, DomainError>> {
    try {
      const appointment = await this.appointmentRepository.findById(id);
      if (!appointment) {
        return Result.fail(new NotFoundError('Cita', id));
      }

      // 1. Aplicar política de estado de la cita antes de modificar
      AppointmentUpdatePolicy.validateCanModify(appointment);

      // 2. Aplicar política de reasignación de trabajadora
      if (dto.workerId !== undefined) {
        if (dto.workerId) {
          const worker = await this.workerRepository.findById(dto.workerId);
          if (!worker) {
            return Result.fail(new NotFoundError('Trabajadora', dto.workerId));
          }
          AppointmentUpdatePolicy.validateWorkerReassignment(worker.businessId, appointment.businessId);
        }
        appointment.reassignWorker(dto.workerId);
      }

      // 3. Aplicar política de cambio o actualización del servicio
      if (dto.serviceId !== undefined) {
        let service = null;
        if (dto.serviceId) {
          service = await this.catalogRepository.findById(dto.serviceId);
          if (!service) {
            return Result.fail(new NotFoundError('Servicio del catálogo', dto.serviceId));
          }
          AppointmentUpdatePolicy.validateServiceChange(service.businessId, appointment.businessId);
        }
        const serviceUpdate = AppointmentUpdatePolicy.resolveServiceUpdate(
          service,
          dto.price,
          dto.durationMinutes
        );
        appointment.updateService(dto.serviceId, serviceUpdate.price, serviceUpdate.durationMinutes);
      } else {
        if (dto.price !== undefined) {
          appointment.updatePrice(dto.price);
        }
      }

      // 4. Aplicar política de reprogramación de horario y duración
      if (dto.scheduledAt !== undefined || dto.durationMinutes !== undefined) {
        const rescheduleTiming = AppointmentUpdatePolicy.resolveRescheduleTime(
          appointment.scheduledAt,
          appointment.durationMinutes,
          dto.scheduledAt,
          dto.durationMinutes
        );
        appointment.reschedule(rescheduleTiming.scheduledAt, rescheduleTiming.durationMinutes);
      }

      // 5. Actualizar notas
      if (dto.notes !== undefined) {
        appointment.updateNotes(dto.notes);
      }

      // 6. Aplicar política de verificación de solapamiento de horarios
      if (appointment.workerId) {
        const overlapping = await this.appointmentRepository.findOverlapping(
          appointment.workerId,
          appointment.scheduledAt,
          appointment.endTime,
          id
        );
        AppointmentUpdatePolicy.validateNoScheduleConflict(overlapping);
      }

      const updated = await this.appointmentRepository.update(appointment);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(
        new DatabaseError(error instanceof Error ? error.message : 'Error inesperado al actualizar la cita.')
      );
    }
  }
}
