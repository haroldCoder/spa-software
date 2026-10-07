import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { SupabaseAppointmentRepository } from '../../infrastructure/repositories/supabase-appointment.repository';
import { SupabaseBusinessRepository } from '@/src/modules/business/infrastructure/repositories/supabase-business.repository';
import { SupabaseClientRepository } from '@/src/modules/clients/infrastructure/repositories/supabase-client.repository';
import { SupabaseWorkerRepository } from '@/src/modules/workers/infrastructure/repositories/supabase-worker.repository';
import { SupabaseCatalogRepository } from '@/src/modules/catalog/infrastructure/repositories/supabase-catalog.repository';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { GetAppointmentByIdUseCase } from '../../application/use-cases/get-appointment-by-id.use-case';
import { ListAppointmentsByBusinessUseCase } from '../../application/use-cases/list-appointments-by-business.use-case';
import { ListAppointmentsByWorkerUseCase } from '../../application/use-cases/list-appointments-by-worker.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/update-appointment.use-case';
import { UpdateAppointmentStatusUseCase } from '../../application/use-cases/update-appointment-status.use-case';
import { DeleteAppointmentUseCase } from '../../application/use-cases/delete-appointment.use-case';
import { ListCompletedAppointmentsUseCase } from '../../application/use-cases/list-completed-appointments.use-case';
import {
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  UpdateAppointmentStatusSchema,
} from '../../application/dtos/appointment.dto';
import { AppointmentFilter } from '../../domain/repositories/appointment.repository.interface';
import { AppointmentMapper } from '../../infrastructure/mappers/appointment.mapper';
import { HttpResponse } from '@/src/shared/presentation/http-response';
import { authenticateRequest } from '@/src/modules/auth/presentation/middlewares/auth.guard';
import { AppointmentStatus } from '../../domain/entities/appointment.entity';

export class AppointmentController {
  private static getUseCases() {
    const supabase = getSupabaseServerClient();
    const appointmentRepo = new SupabaseAppointmentRepository(supabase);
    const businessRepo = new SupabaseBusinessRepository(supabase);
    const clientRepo = new SupabaseClientRepository(supabase);
    const workerRepo = new SupabaseWorkerRepository(supabase);
    const catalogRepo = new SupabaseCatalogRepository(supabase);

    return {
      appointmentRepo,
      createAppointmentUseCase: new CreateAppointmentUseCase(
        appointmentRepo,
        businessRepo,
        clientRepo,
        workerRepo,
        catalogRepo
      ),
      getAppointmentByIdUseCase: new GetAppointmentByIdUseCase(appointmentRepo),
      listAppointmentsByBusinessUseCase: new ListAppointmentsByBusinessUseCase(appointmentRepo, businessRepo),
      listAppointmentsByWorkerUseCase: new ListAppointmentsByWorkerUseCase(appointmentRepo, workerRepo),
      updateAppointmentUseCase: new UpdateAppointmentUseCase(appointmentRepo, workerRepo, catalogRepo),
      updateAppointmentStatusUseCase: new UpdateAppointmentStatusUseCase(appointmentRepo),
      deleteAppointmentUseCase: new DeleteAppointmentUseCase(appointmentRepo),
      listCompletedAppointmentsUseCase: new ListCompletedAppointmentsUseCase(appointmentRepo, businessRepo),
    };
  }

  public static async create(
    request: NextRequest,
    businessIdFromParams?: string,
    workerIdFromParams?: string
  ): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';
      const isWorker = auth.user.role === 'WORKER' || auth.user.userType === 'WORKER';

      const body = await request.json();

      const businessId =
        businessIdFromParams ||
        body.businessId ||
        auth.user.businessId;

      if (!businessId) {
        return HttpResponse.badRequest('Se requiere el ID del negocio (businessId) para agendar la cita.');
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden('No tienes permisos para agendar citas en otro negocio.');
      }

      // Si es trabajadora y se especifica workerId distinto a su propio ID, validar
      let workerId = workerIdFromParams || body.workerId;
      if (isWorker) {
        if (!workerId) {
          workerId = auth.user.id;
        } else if (workerId !== auth.user.id) {
          return HttpResponse.forbidden('Una trabajadora solo puede agendar citas para sí misma.');
        }
      }

      const payload = {
        ...body,
        businessId,
        workerId: workerId ?? null,
      };

      const validatedData = CreateAppointmentSchema.parse(payload);
      const { createAppointmentUseCase, appointmentRepo } = this.getUseCases();

      const result = await createAppointmentUseCase.execute(validatedData, {
        id: auth.user.id,
        role: isOwner ? 'BUSINESS_OWNER' : 'WORKER',
      });

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const created = result.getValue();
      // Consultar con relaciones para devolver DTO enriquecido
      const enriched = await appointmentRepo.findByIdWithRelations(created.id!);
      const dto = enriched ? AppointmentMapper.rowToDTO(enriched) : AppointmentMapper.toDTO(created);

      return HttpResponse.created(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async getById(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const { appointmentRepo } = this.getUseCases();

      const row = await appointmentRepo.findByIdWithRelations(id);
      if (!row) {
        return HttpResponse.badRequest(`La cita con ID '${id}' no fue encontrada.`);
      }

      if (auth.user.businessId !== row.business_id) {
        return HttpResponse.forbidden('No tienes permisos para consultar citas de otro negocio.');
      }

      const dto = AppointmentMapper.rowToDTO(row);
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async list(request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const { appointmentRepo } = this.getUseCases();

      const searchParams = request.nextUrl.searchParams;
      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';

      const filter: AppointmentFilter = {
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      };

      const statusParam = searchParams.get('status');
      if (statusParam) {
        filter.status = statusParam.split(',') as AppointmentStatus[];
      }

      const workerIdParam = searchParams.get('workerId');
      if (workerIdParam) {
        filter.workerId = workerIdParam;
      } else if (!isOwner) {
        // Por defecto una trabajadora ve sus propias citas
        filter.workerId = auth.user.id;
      }

      const clientIdParam = searchParams.get('clientId');
      if (clientIdParam) filter.clientId = clientIdParam;

      const serviceIdParam = searchParams.get('serviceId');
      if (serviceIdParam) filter.serviceId = serviceIdParam;

      const startDateParam = searchParams.get('startDate');
      if (startDateParam) filter.startDate = new Date(startDateParam);

      const endDateParam = searchParams.get('endDate');
      if (endDateParam) filter.endDate = new Date(endDateParam);

      const paginated = await appointmentRepo.findByBusinessIdWithRelations(auth.user.businessId, filter);
      const dtos = paginated.items.map((r) => AppointmentMapper.rowToDTO(r));

      return HttpResponse.paginated(dtos, paginated.total, paginated.page, paginated.limit);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async listByBusiness(businessId: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden('No tienes permisos para consultar citas de otro negocio.');
      }

      const { appointmentRepo } = this.getUseCases();
      const searchParams = request.nextUrl.searchParams;
      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';

      const filter: AppointmentFilter = {
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      };

      const statusParam = searchParams.get('status');
      if (statusParam) {
        filter.status = statusParam.split(',') as AppointmentStatus[];
      }

      const workerIdParam = searchParams.get('workerId');
      if (workerIdParam) {
        filter.workerId = workerIdParam;
      } else if (!isOwner) {
        filter.workerId = auth.user.id;
      }

      const clientIdParam = searchParams.get('clientId');
      if (clientIdParam) filter.clientId = clientIdParam;

      const startDateParam = searchParams.get('startDate');
      if (startDateParam) filter.startDate = new Date(startDateParam);

      const endDateParam = searchParams.get('endDate');
      if (endDateParam) filter.endDate = new Date(endDateParam);

      const paginated = await appointmentRepo.findByBusinessIdWithRelations(businessId, filter);
      const dtos = paginated.items.map((r) => AppointmentMapper.rowToDTO(r));

      return HttpResponse.paginated(dtos, paginated.total, paginated.page, paginated.limit);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async listCompleted(
    request: NextRequest,
    businessIdFromParams?: string
  ): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const businessId =
        businessIdFromParams ||
        request.nextUrl.searchParams.get('businessId') ||
        auth.user.businessId;

      if (!businessId) {
        return HttpResponse.badRequest('Se requiere el ID del negocio para consultar las citas completadas.');
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden('No tienes permisos para consultar citas de otro negocio.');
      }

      const { appointmentRepo } = this.getUseCases();
      const rows = await appointmentRepo.findByCompletedStatusWithRelations(businessId);
      const dtos = rows.map((r) => AppointmentMapper.rowToDTO(r));

      return HttpResponse.ok(dtos);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async listByWorker(workerId: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';

      // Una trabajadora solo puede ver sus propias citas a menos que sea dueño
      if (!isOwner && auth.user.id !== workerId) {
        return HttpResponse.forbidden('No tienes permisos para ver las citas de otra trabajadora.');
      }

      const { appointmentRepo } = this.getUseCases();
      const searchParams = request.nextUrl.searchParams;

      const filter: AppointmentFilter = {
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      };

      const statusParam = searchParams.get('status');
      if (statusParam) {
        filter.status = statusParam.split(',') as AppointmentStatus[];
      }

      const startDateParam = searchParams.get('startDate');
      if (startDateParam) filter.startDate = new Date(startDateParam);

      const endDateParam = searchParams.get('endDate');
      if (endDateParam) filter.endDate = new Date(endDateParam);

      const paginated = await appointmentRepo.findByWorkerIdWithRelations(workerId, filter);
      const dtos = paginated.items.map((r) => AppointmentMapper.rowToDTO(r));

      return HttpResponse.paginated(dtos, paginated.total, paginated.page, paginated.limit);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const { appointmentRepo, updateAppointmentUseCase } = this.getUseCases();

      const existing = await appointmentRepo.findById(id);
      if (!existing) {
        return HttpResponse.badRequest(`La cita con ID '${id}' no fue encontrada.`);
      }

      if (auth.user.businessId !== existing.businessId) {
        return HttpResponse.forbidden('No tienes permisos para modificar citas de otro negocio.');
      }

      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';
      if (!isOwner && existing.workerId !== auth.user.id) {
        return HttpResponse.forbidden('No tienes permisos para modificar citas asignadas a otra persona.');
      }

      const body = await request.json();
      const validatedData = UpdateAppointmentSchema.parse(body);

      const result = await updateAppointmentUseCase.execute(id, validatedData);
      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const enriched = await appointmentRepo.findByIdWithRelations(id);
      const dto = enriched ? AppointmentMapper.rowToDTO(enriched) : AppointmentMapper.toDTO(result.getValue());

      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async updateStatus(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const { appointmentRepo, updateAppointmentStatusUseCase } = this.getUseCases();

      const existing = await appointmentRepo.findById(id);
      if (!existing) {
        return HttpResponse.badRequest(`La cita con ID '${id}' no fue encontrada.`);
      }

      if (auth.user.businessId !== existing.businessId) {
        return HttpResponse.forbidden('No tienes permisos para actualizar citas de otro negocio.');
      }

      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';
      if (!isOwner && existing.workerId !== auth.user.id) {
        return HttpResponse.forbidden('No tienes permisos para actualizar el estado de esta cita.');
      }

      const body = await request.json();
      const validatedData = UpdateAppointmentStatusSchema.parse(body);

      const result = await updateAppointmentStatusUseCase.execute(id, validatedData);
      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const enriched = await appointmentRepo.findByIdWithRelations(id);
      const dto = enriched ? AppointmentMapper.rowToDTO(enriched) : AppointmentMapper.toDTO(result.getValue());

      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async delete(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const { appointmentRepo, deleteAppointmentUseCase } = this.getUseCases();

      const existing = await appointmentRepo.findById(id);
      if (!existing) {
        return HttpResponse.badRequest(`La cita con ID '${id}' no fue encontrada.`);
      }

      if (auth.user.businessId !== existing.businessId) {
        return HttpResponse.forbidden('No tienes permisos para eliminar citas de otro negocio.');
      }

      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';
      if (!isOwner && existing.workerId !== auth.user.id) {
        return HttpResponse.forbidden('No tienes permisos para eliminar citas asignadas a otra persona.');
      }

      const result = await deleteAppointmentUseCase.execute(id);
      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      return HttpResponse.noContent();
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }
}
