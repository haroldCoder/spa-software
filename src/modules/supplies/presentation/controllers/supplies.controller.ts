import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { SupabaseSupplyRepository } from '../../infrastructure/repositories/supabase-supply.repository';
import { SupabaseSupplyMovementRepository } from '../../infrastructure/repositories/supabase-supply-movement.repository';
import { SupabaseBusinessRepository } from '@/src/modules/business/infrastructure/repositories/supabase-business.repository';
import { CreateSupplyUseCase } from '../../application/use-cases/create-supply.use-case';
import { UpdateSupplyUseCase } from '../../application/use-cases/update-supply.use-case';
import { DeleteSupplyUseCase } from '../../application/use-cases/delete-supply.use-case';
import { GetSupplyByIdUseCase } from '../../application/use-cases/get-supply-by-id.use-case';
import { ListSuppliesByBusinessUseCase } from '../../application/use-cases/list-supplies-by-business.use-case';
import { RegisterSupplyMovementUseCase } from '../../application/use-cases/register-supply-movement.use-case';
import { ListSupplyMovementsUseCase } from '../../application/use-cases/list-supply-movements.use-case';
import { GetSuppliesSummaryUseCase } from '../../application/use-cases/get-supplies-summary.use-case';
import {
  CreateSupplySchema,
  UpdateSupplySchema,
} from '../../application/dtos/supply.dto';
import { RegisterSupplyMovementSchema } from '../../application/dtos/supply-movement.dto';
import { SupplyMapper } from '../../infrastructure/mappers/supply.mapper';
import { SupplyMovementMapper } from '../../infrastructure/mappers/supply-movement.mapper';
import { SupplyFilter } from '../../domain/repositories/supply.repository.interface';
import { SupplyMovementFilter } from '../../domain/repositories/supply-movement.repository.interface';
import { SupplyItemType } from '../../domain/entities/supply.entity';
import { SupplyMovementType } from '../../domain/entities/supply-movement.entity';
import { HttpResponse } from '@/src/shared/presentation/http-response';
import { authenticateRequest } from '@/src/modules/auth/presentation/middlewares/auth.guard';

export class SuppliesController {
  private static getUseCases() {
    const supabase = getSupabaseServerClient();
    const supplyRepo = new SupabaseSupplyRepository(supabase);
    const movementRepo = new SupabaseSupplyMovementRepository(supabase);
    const businessRepo = new SupabaseBusinessRepository(supabase);

    return {
      supplyRepo,
      movementRepo,
      businessRepo,
      createSupplyUseCase: new CreateSupplyUseCase(supplyRepo, businessRepo),
      updateSupplyUseCase: new UpdateSupplyUseCase(supplyRepo),
      deleteSupplyUseCase: new DeleteSupplyUseCase(supplyRepo),
      getSupplyByIdUseCase: new GetSupplyByIdUseCase(supplyRepo),
      listSuppliesByBusinessUseCase: new ListSuppliesByBusinessUseCase(supplyRepo, businessRepo),
      registerSupplyMovementUseCase: new RegisterSupplyMovementUseCase(supplyRepo, movementRepo),
      listSupplyMovementsUseCase: new ListSupplyMovementsUseCase(movementRepo, supplyRepo),
      getSuppliesSummaryUseCase: new GetSuppliesSummaryUseCase(supplyRepo, businessRepo),
    };
  }

  /**
   * Crear un nuevo insumo o útil para el spa
   */
  public static async create(
    request: NextRequest,
    businessIdFromParams?: string
  ): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });
      const body = await request.json();

      const businessId =
        businessIdFromParams ||
        body.businessId ||
        body.business_id ||
        auth.user.businessId;

      if (!businessId) {
        return HttpResponse.badRequest(
          'Se requiere el identificador del negocio (businessId) para registrar el insumo o útil.'
        );
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden(
          'No tienes permisos para registrar insumos o útiles en otro negocio o spa.'
        );
      }

      const payload = {
        ...body,
        businessId,
      };

      const validatedData = CreateSupplySchema.parse(payload);
      const { createSupplyUseCase } = this.getUseCases();
      const result = await createSupplyUseCase.execute(validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = SupplyMapper.toDTO(result.getValue());
      return HttpResponse.created(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  /**
   * Listar todos los insumos y útiles del negocio con paginación y filtros.
   * Requiere explícitamente el parámetro businessId (por query param o ruta).
   */
  public static async list(request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });
      const searchParams = request.nextUrl.searchParams;

      const businessId = searchParams.get('businessId') || searchParams.get('business_id');

      if (!businessId) {
        return HttpResponse.badRequest(
          'El parámetro "businessId" es obligatorio para retornar los insumos y útiles del negocio.'
        );
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden(
          'No tienes permisos para consultar los insumos de otro negocio.'
        );
      }

      return this.executeList(businessId, searchParams);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  /**
   * Listar insumos cuando el businessId viene en la ruta /api/businesses/[id]/supplies
   */
  public static async listByBusiness(
    businessId: string,
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });

      if (!businessId) {
        return HttpResponse.badRequest(
          'El ID del negocio (businessId) es obligatorio para retornar los insumos.'
        );
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden(
          'No tienes permisos para consultar los insumos de otro negocio.'
        );
      }

      const searchParams = request.nextUrl.searchParams;
      return this.executeList(businessId, searchParams);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  private static async executeList(
    businessId: string,
    searchParams: URLSearchParams
  ): Promise<NextResponse> {
    const filter: SupplyFilter = {
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
    };

    const itemTypeParam = searchParams.get('itemType');
    if (itemTypeParam) {
      filter.itemType = itemTypeParam.toUpperCase() as SupplyItemType;
    }

    const categoryParam = searchParams.get('category');
    if (categoryParam) filter.category = categoryParam;

    const activeParam = searchParams.get('isActive');
    if (activeParam !== null) filter.isActive = activeParam === 'true';

    const lowStockParam = searchParams.get('lowStockOnly');
    if (lowStockParam !== null) filter.lowStockOnly = lowStockParam === 'true';

    const search = searchParams.get('search');
    if (search) filter.search = search;

    const { listSuppliesByBusinessUseCase } = this.getUseCases();
    const result = await listSuppliesByBusinessUseCase.execute(businessId, filter);

    if (result.isFailure) {
      return HttpResponse.handleDomainError(result.getError());
    }

    const paginated = result.getValue();
    const dtos = paginated.items.map((s) => SupplyMapper.toDTO(s));

    return HttpResponse.paginated(dtos, paginated.total, paginated.page, paginated.limit);
  }

  /**
   * Obtener un insumo o útil por su ID
   */
  public static async getById(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });
      const { getSupplyByIdUseCase } = this.getUseCases();

      const result = await getSupplyByIdUseCase.execute(id, auth.user.businessId);
      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = SupplyMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  /**
   * Actualizar un insumo o útil existente
   */
  public static async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });
      const body = await request.json();
      const validatedData = UpdateSupplySchema.parse(body);

      const { updateSupplyUseCase } = this.getUseCases();
      const result = await updateSupplyUseCase.execute(id, auth.user.businessId, validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = SupplyMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  /**
   * Desactivar insumo (soft delete)
   */
  public static async delete(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });
      const { deleteSupplyUseCase } = this.getUseCases();

      const result = await deleteSupplyUseCase.execute(id, auth.user.businessId);
      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      return HttpResponse.noContent();
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  /**
   * Registrar movimiento de stock (Compra, Consumo, Merma, Ajuste)
   */
  public static async registerMovement(
    supplyIdFromRoute: string,
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });
      const body = await request.json();

      const businessId = body.businessId || body.business_id || auth.user.businessId;

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden(
          'No tienes permisos para registrar movimientos en otro negocio o spa.'
        );
      }

      const payload = {
        ...body,
        supplyId: supplyIdFromRoute || body.supplyId,
        businessId,
      };

      const validatedData = RegisterSupplyMovementSchema.parse(payload);
      const { registerSupplyMovementUseCase } = this.getUseCases();

      const result = await registerSupplyMovementUseCase.execute(validatedData, {
        id: auth.user.id,
        role: auth.user.role,
      });

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const { movement, supply } = result.getValue();
      const dto = {
        movement: SupplyMovementMapper.toDTO(movement, { supplyName: supply.name }),
        updatedSupply: SupplyMapper.toDTO(supply),
      };

      return HttpResponse.created(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  /**
   * Historial de movimientos de un insumo específico
   */
  public static async listMovementsBySupply(
    supplyId: string,
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });
      const searchParams = request.nextUrl.searchParams;

      const filter: SupplyMovementFilter = {
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      };

      const typeParam = searchParams.get('movementType');
      if (typeParam) filter.movementType = typeParam.toUpperCase() as SupplyMovementType;

      const workerId = searchParams.get('workerId');
      if (workerId) filter.workerId = workerId;

      const start = searchParams.get('startDate');
      if (start) filter.startDate = new Date(start);

      const end = searchParams.get('endDate');
      if (end) filter.endDate = new Date(end);

      const { listSupplyMovementsUseCase } = this.getUseCases();
      const result = await listSupplyMovementsUseCase.executeForSupply(
        supplyId,
        auth.user.businessId,
        filter
      );

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const paginated = result.getValue();
      const dtos = paginated.items.map((m) => SupplyMovementMapper.toDTO(m));

      return HttpResponse.paginated(dtos, paginated.total, paginated.page, paginated.limit);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  /**
   * Historial de movimientos global del negocio (kardex general)
   * Requiere obligatoriamente el businessId
   */
  public static async listAllMovements(request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });
      const searchParams = request.nextUrl.searchParams;

      const businessId = searchParams.get('businessId') || searchParams.get('business_id');

      if (!businessId) {
        return HttpResponse.badRequest(
          'El parámetro "businessId" es obligatorio para consultar el historial de movimientos de insumos.'
        );
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden(
          'No tienes permisos para consultar los movimientos de otro negocio.'
        );
      }

      const filter: SupplyMovementFilter = {
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      };

      const supplyId = searchParams.get('supplyId');
      if (supplyId) filter.supplyId = supplyId;

      const typeParam = searchParams.get('movementType');
      if (typeParam) filter.movementType = typeParam.toUpperCase() as SupplyMovementType;

      const workerId = searchParams.get('workerId');
      if (workerId) filter.workerId = workerId;

      const start = searchParams.get('startDate');
      if (start) filter.startDate = new Date(start);

      const end = searchParams.get('endDate');
      if (end) filter.endDate = new Date(end);

      const { movementRepo } = this.getUseCases();
      const paginated = await movementRepo.findRowsByBusinessId(businessId, filter);
      const dtos = paginated.items.map((r) => SupplyMovementMapper.rowToDTO(r));

      return HttpResponse.paginated(dtos, paginated.total, paginated.page, paginated.limit);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  /**
   * Resumen y métricas de insumos para el dashboard del dueño
   * Requiere obligatoriamente businessId
   */
  public static async getSummary(request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request, { requiredRole: 'BUSINESS_OWNER' });
      const searchParams = request.nextUrl.searchParams;

      const businessId = searchParams.get('businessId') || searchParams.get('business_id');

      if (!businessId) {
        return HttpResponse.badRequest(
          'El parámetro "businessId" es obligatorio para consultar el resumen de insumos del negocio.'
        );
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden(
          'No tienes permisos para consultar el resumen de otro negocio.'
        );
      }

      const { getSuppliesSummaryUseCase } = this.getUseCases();
      const result = await getSuppliesSummaryUseCase.execute(businessId);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      return HttpResponse.ok(result.getValue());
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }
}
