import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError } from '@/src/shared/domain/errors';
import { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';

export class DeleteAppointmentUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  public async execute(id: string): Promise<Result<void, DomainError>> {
    try {
      const appointment = await this.appointmentRepository.findById(id);
      if (!appointment) {
        return Result.fail(new NotFoundError('Cita', id));
      }

      await this.appointmentRepository.delete(id);
      return Result.ok();
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(new DatabaseError(error instanceof Error ? error.message : 'Error inesperado al eliminar la cita.'));
    }
  }
}
