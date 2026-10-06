import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError } from '@/src/shared/domain/errors';
import {
  IAppointmentRepository,
  AppointmentFilter,
  PaginatedAppointments,
} from '../../domain/repositories/appointment.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';

export class ListAppointmentsByBusinessUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(
    businessId: string,
    filter?: AppointmentFilter
  ): Promise<Result<PaginatedAppointments, DomainError>> {
    try {
      const business = await this.businessRepository.findById(businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio o Spa', businessId));
      }

      const appointments = await this.appointmentRepository.findByBusinessId(businessId, filter);
      return Result.ok(appointments);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(
        new DatabaseError(error instanceof Error ? error.message : 'Error inesperado al listar las citas del negocio.')
      );
    }
  }
}
