import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError } from '@/src/shared/domain/errors';
import { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../domain/entities/appointment.entity';
import { UpdateAppointmentStatusDTO } from '../dtos/appointment.dto';

export class UpdateAppointmentStatusUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  public async execute(id: string, dto: UpdateAppointmentStatusDTO): Promise<Result<Appointment, DomainError>> {
    try {
      const appointment = await this.appointmentRepository.findById(id);
      if (!appointment) {
        return Result.fail(new NotFoundError('Cita', id));
      }

      switch (dto.status) {
        case 'CONFIRMED':
          appointment.confirm();
          break;
        case 'COMPLETED':
          appointment.complete();
          break;
        case 'CANCELLED':
          appointment.cancel(dto.cancellationReason ?? undefined);
          break;
        case 'NO_SHOW':
          appointment.markNoShow();
          break;
        default:
          break;
      }

      const updated = await this.appointmentRepository.update(appointment);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(new DatabaseError(error instanceof Error ? error.message : 'Error inesperado al cambiar el estado de la cita.'));
    }
  }
}
