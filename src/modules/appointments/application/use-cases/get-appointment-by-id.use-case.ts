import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError } from '@/src/shared/domain/errors';
import { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../domain/entities/appointment.entity';

export class GetAppointmentByIdUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  public async execute(id: string): Promise<Result<Appointment, DomainError>> {
    try {
      const appointment = await this.appointmentRepository.findById(id);
      if (!appointment) {
        return Result.fail(new NotFoundError('Cita', id));
      }
      return Result.ok(appointment);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(new DatabaseError(error instanceof Error ? error.message : 'Error inesperado al consultar la cita.'));
    }
  }
}
