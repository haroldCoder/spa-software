import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError } from '@/src/shared/domain/errors';
import { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { IClientRepository } from '@/src/modules/clients/domain/repositories/client.repository.interface';
import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';
import { ICatalogRepository } from '@/src/modules/catalog/domain/repositories/catalog.repository.interface';
import { Appointment } from '../../domain/entities/appointment.entity';
import { AppointmentCreationPolicy } from '../../domain/policies/appointment-creation.policy';
import { CreateAppointmentDTO } from '../dtos/appointment.dto';

export interface CreateAppointmentActor {
  id: string;
  role: 'BUSINESS_OWNER' | 'WORKER';
}

export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly businessRepository: IBusinessRepository,
    private readonly clientRepository: IClientRepository,
    private readonly workerRepository: IWorkerRepository,
    private readonly catalogRepository: ICatalogRepository
  ) {}

  public async execute(
    dto: CreateAppointmentDTO,
    actor?: CreateAppointmentActor
  ): Promise<Result<Appointment, DomainError>> {
    try {
      // 1. Validar existencia del Negocio / Spa
      const business = await this.businessRepository.findById(dto.businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio o Spa', dto.businessId));
      }

      // 2. Validar existencia y política de pertenencia del Cliente
      const client = await this.clientRepository.findById(dto.clientId);
      if (!client) {
        return Result.fail(new NotFoundError('Cliente', dto.clientId));
      }
      AppointmentCreationPolicy.validateClientBelongsToBusiness(client.businessId, dto.businessId);

      // 3. Resolver asignación y validar política de Trabajadora
      const workerId = AppointmentCreationPolicy.resolveWorkerAssignment(dto.workerId, actor);
      if (workerId) {
        const worker = await this.workerRepository.findById(workerId);
        if (!worker) {
          return Result.fail(new NotFoundError('Trabajadora', workerId));
        }
        AppointmentCreationPolicy.validateWorkerBelongsToBusiness(worker.businessId, dto.businessId);
      }

      // 4. Validar política de Servicio del catálogo si fue seleccionado
      let service = null;
      if (dto.serviceId) {
        service = await this.catalogRepository.findById(dto.serviceId);
        if (!service) {
          return Result.fail(new NotFoundError('Servicio del catálogo', dto.serviceId));
        }
        AppointmentCreationPolicy.validateServiceBelongsToBusiness(service.businessId, dto.businessId);
      }

      // 5. Aplicar política de cálculo de tiempo y tarifas
      const timingAndPrice = AppointmentCreationPolicy.resolveTimingAndPricing({
        scheduledAt: dto.scheduledAt,
        durationMinutes: dto.durationMinutes,
        price: dto.price,
        service,
      });

      // 6. Aplicar política de conflicto de horario si hay trabajadora asignada
      if (workerId) {
        const overlapping = await this.appointmentRepository.findOverlapping(
          workerId,
          timingAndPrice.scheduledAt,
          timingAndPrice.endTime
        );
        AppointmentCreationPolicy.validateNoScheduleConflict(overlapping);
      }

      // 7. Instanciar la entidad del dominio
      const appointment = Appointment.create({
        businessId: dto.businessId,
        clientId: dto.clientId,
        workerId,
        serviceId: dto.serviceId ?? null,
        scheduledAt: timingAndPrice.scheduledAt,
        durationMinutes: timingAndPrice.durationMinutes,
        endTime: timingAndPrice.endTime,
        status: 'PENDING',
        price: timingAndPrice.price,
        notes: dto.notes ?? null,
        createdById: actor?.id ?? null,
        createdByRole: actor?.role ?? null,
      });

      // 8. Persistir en el repositorio
      const savedAppointment = await this.appointmentRepository.save(appointment);
      return Result.ok(savedAppointment);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(
        new DatabaseError(error instanceof Error ? error.message : 'Error inesperado al crear la cita.')
      );
    }
  }
}
