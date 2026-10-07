import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { SupabaseSaleRepository } from '../../infrastructure/repositories/supabase-sale.repository';
import { SupabaseBusinessRepository } from '@/src/modules/business/infrastructure/repositories/supabase-business.repository';
import { SupabaseClientRepository } from '@/src/modules/clients/infrastructure/repositories/supabase-client.repository';
import { SupabaseWorkerRepository } from '@/src/modules/workers/infrastructure/repositories/supabase-worker.repository';
import { SupabaseCatalogRepository } from '@/src/modules/catalog/infrastructure/repositories/supabase-catalog.repository';
import { CreateSaleUseCase } from '../../application/use-cases/create-sale.use-case';
import { GetSaleByIdUseCase } from '../../application/use-cases/get-sale-by-id.use-case';
import { ListSalesByBusinessUseCase } from '../../application/use-cases/list-sales-by-business.use-case';
import { CreateSaleSchema } from '../../application/dtos/sale.dto';
import { SaleFilter } from '../../domain/repositories/sale.repository.interface';
import { SaleMapper } from '../../infrastructure/mappers/sale.mapper';
import { HttpResponse } from '@/src/shared/presentation/http-response';
import { authenticateRequest } from '@/src/modules/auth/presentation/middlewares/auth.guard';
import { SupabaseAppointmentRepository } from '@/src/modules/appointments/infrastructure/repositories/supabase-appointment.repository';

export class ShoppingController {
  private static getUseCases() {
    const supabase = getSupabaseServerClient();
    const appointmentRepo = new SupabaseAppointmentRepository(supabase);
    const saleRepo = new SupabaseSaleRepository(supabase, appointmentRepo);
    const businessRepo = new SupabaseBusinessRepository(supabase);
    const clientRepo = new SupabaseClientRepository(supabase);
    const workerRepo = new SupabaseWorkerRepository(supabase);
    const catalogRepo = new SupabaseCatalogRepository(supabase);

    return {
      saleRepo,
      createSaleUseCase: new CreateSaleUseCase(
        saleRepo,
        businessRepo,
        clientRepo,
        workerRepo,
        catalogRepo
      ),
      getSaleByIdUseCase: new GetSaleByIdUseCase(saleRepo),
      listSalesByBusinessUseCase: new ListSalesByBusinessUseCase(saleRepo, businessRepo),
    };
  }

  public static async create(
    request: NextRequest,
    businessIdFromParams?: string
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
        return HttpResponse.badRequest('Se requiere el ID del negocio (businessId) para registrar la venta.');
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden('No tienes permisos para registrar ventas en otro negocio o spa.');
      }

      let workerId = body.workerId;
      if (isWorker) {
        if (!workerId) {
          workerId = auth.user.id;
        } else if (workerId !== auth.user.id) {
          return HttpResponse.forbidden('Una trabajadora solo puede registrar ventas asignadas a sí misma.');
        }
      }

      const payload = {
        ...body,
        businessId,
        workerId: workerId ?? null,
      };

      const validatedData = CreateSaleSchema.parse(payload);
      const { createSaleUseCase, saleRepo } = this.getUseCases();

      const result = await createSaleUseCase.execute(validatedData, {
        id: auth.user.id,
        role: isOwner ? 'BUSINESS_OWNER' : 'WORKER',
      });

      if (result.isFailure) {
        const error = result.getError();
        return HttpResponse.handleDomainError(error);
      }

      const savedSale = result.getValue();
      const row = await saleRepo.findByIdWithRelations(savedSale.id!);
      const dto = row ? SaleMapper.rowToDTO(row) : SaleMapper.toDTO(savedSale);

      return HttpResponse.created(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async list(request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const { saleRepo } = this.getUseCases();

      const searchParams = request.nextUrl.searchParams;
      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';

      const filter: SaleFilter = {
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      };

      const itemTypeParam = searchParams.get('itemType');
      if (itemTypeParam === 'SERVICE' || itemTypeParam === 'PRODUCT') {
        filter.itemType = itemTypeParam;
      }

      const clientIdParam = searchParams.get('clientId');
      if (clientIdParam) filter.clientId = clientIdParam;

      const workerIdParam = searchParams.get('workerId');
      if (workerIdParam) {
        filter.workerId = workerIdParam;
      } else if (!isOwner) {
        // Por defecto una trabajadora solo ve sus ventas registradas
        filter.workerId = auth.user.id;
      }

      const startDateParam = searchParams.get('startDate');
      if (startDateParam) filter.startDate = new Date(startDateParam);

      const endDateParam = searchParams.get('endDate');
      if (endDateParam) filter.endDate = new Date(endDateParam);

      const paginated = await saleRepo.findByBusinessIdWithRelations(auth.user.businessId, filter);
      const dtos = paginated.items.map((r) => SaleMapper.rowToDTO(r));

      return HttpResponse.paginated(dtos, paginated.total, paginated.page, paginated.limit);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async listByBusiness(
    businessId: string,
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden('No tienes permisos para consultar ventas de otro negocio.');
      }

      const searchParams = request.nextUrl.searchParams;
      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';

      const filter: SaleFilter = {
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      };

      const itemTypeParam = searchParams.get('itemType');
      if (itemTypeParam === 'SERVICE' || itemTypeParam === 'PRODUCT') {
        filter.itemType = itemTypeParam;
      }

      const clientIdParam = searchParams.get('clientId');
      if (clientIdParam) filter.clientId = clientIdParam;

      const workerIdParam = searchParams.get('workerId');
      if (workerIdParam) {
        filter.workerId = workerIdParam;
      } else if (!isOwner) {
        filter.workerId = auth.user.id;
      }

      const startDateParam = searchParams.get('startDate');
      if (startDateParam) filter.startDate = new Date(startDateParam);

      const endDateParam = searchParams.get('endDate');
      if (endDateParam) filter.endDate = new Date(endDateParam);

      const { saleRepo } = this.getUseCases();
      const paginated = await saleRepo.findByBusinessIdWithRelations(businessId, filter);
      const dtos = paginated.items.map((r) => SaleMapper.rowToDTO(r));

      return HttpResponse.paginated(dtos, paginated.total, paginated.page, paginated.limit);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async getById(
    id: string,
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);
      const { saleRepo } = this.getUseCases();

      const row = await saleRepo.findByIdWithRelations(id);
      if (!row) {
        return HttpResponse.badRequest(`La venta con ID '${id}' no fue encontrada.`);
      }

      if (auth.user.businessId !== row.business_id) {
        return HttpResponse.forbidden('No tienes permisos para consultar ventas de otro negocio.');
      }

      const isOwner = auth.user.role === 'BUSINESS_OWNER' || auth.user.userType === 'BUSINESS';
      if (!isOwner && row.worker_id !== auth.user.id) {
        return HttpResponse.forbidden('No tienes permisos para consultar esta venta.');
      }

      const dto = SaleMapper.rowToDTO(row);
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async listCompletedServices(
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
        return HttpResponse.badRequest('Se requiere el ID del negocio para consultar los servicios completados.');
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden('No tienes permisos para consultar ventas de otro negocio.');
      }

      const { saleRepo } = this.getUseCases();
      const rows = await saleRepo.findCompletedServicesWithRelations(businessId);
      const dtos = rows.map((r) => SaleMapper.rowToDTO(r));

      return HttpResponse.ok(dtos);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }
}
