import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError } from '@/src/shared/domain/errors';
import {
  IAppointmentRepository,
  AppointmentFilter,
  PaginatedAppointments,
} from '../../domain/repositories/appointment.repository.interface';
import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';

export class ListAppointmentsByWorkerUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly workerRepository: IWorkerRepository
  ) {}

  public async execute(
    workerId: string,
    filter?: AppointmentFilter
  ): Promise<Result<PaginatedAppointments, DomainError>> {
    try {
      const worker = await this.workerRepository.findById(workerId);
      if (!worker) {
        return Result.fail(new NotFoundError('Trabajadora', workerId));
      }

      const appointments = await this.appointmentRepository.findByWorkerId(workerId, filter);
      return Result.ok(appointments);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(
        new DatabaseError(error instanceof Error ? error.message : 'Error inesperado al listar las citas de la trabajadora.')
      );
    }
  }
}
