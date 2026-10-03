import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { SupabaseCatalogRepository } from '../../infrastructure/repositories/supabase-catalog.repository';
import { SupabaseBusinessRepository } from '@/src/modules/business/infrastructure/repositories/supabase-business.repository';
import { CreateCatalogItemUseCase } from '../../application/use-cases/create-catalog-item.use-case';
import { GetCatalogItemByIdUseCase } from '../../application/use-cases/get-catalog-item-by-id.use-case';
import { ListCatalogByBusinessUseCase } from '../../application/use-cases/list-catalog-by-business.use-case';
import { UpdateCatalogItemUseCase } from '../../application/use-cases/update-catalog-item.use-case';
import { DeleteCatalogItemUseCase } from '../../application/use-cases/delete-catalog-item.use-case';
import { CreateCatalogItemSchema, UpdateCatalogItemSchema } from '../../application/dtos/catalog-item.dto';
import { CatalogItemMapper } from '../../infrastructure/mappers/catalog-item.mapper';
import { CatalogItemType } from '../../domain/entities/catalog-item.entity';
import { HttpResponse } from '@/src/shared/presentation/http-response';

export class CatalogController {
  private static getUseCases() {
    const supabase = getSupabaseServerClient();
    const catalogRepo = new SupabaseCatalogRepository(supabase);
    const businessRepo = new SupabaseBusinessRepository(supabase);

    return {
      createCatalogItemUseCase: new CreateCatalogItemUseCase(catalogRepo, businessRepo),
      getCatalogItemByIdUseCase: new GetCatalogItemByIdUseCase(catalogRepo),
      listCatalogByBusinessUseCase: new ListCatalogByBusinessUseCase(catalogRepo, businessRepo),
      updateCatalogItemUseCase: new UpdateCatalogItemUseCase(catalogRepo),
      deleteCatalogItemUseCase: new DeleteCatalogItemUseCase(catalogRepo),
    };
  }

  public static async create(request: NextRequest, businessIdFromParams?: string): Promise<NextResponse> {
    try {
      const body = await request.json();
      const payload = {
        ...body,
        businessId: businessIdFromParams || body.businessId,
      };

      const validatedData = CreateCatalogItemSchema.parse(payload);
      const { createCatalogItemUseCase } = this.getUseCases();
      const result = await createCatalogItemUseCase.execute(validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = CatalogItemMapper.toDTO(result.getValue());
      return HttpResponse.created(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async listByBusiness(businessId: string, request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const typeParam = searchParams.get('itemType');
      const itemType = typeParam ? (typeParam.toUpperCase() as CatalogItemType) : undefined;
      const category = searchParams.get('category') || undefined;
      const activeParam = searchParams.get('isActive');
      const isActive = activeParam !== null ? activeParam === 'true' : undefined;

      const { listCatalogByBusinessUseCase } = this.getUseCases();
      const result = await listCatalogByBusinessUseCase.execute(businessId, { itemType, category, isActive });

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dtos = result.getValue().map(CatalogItemMapper.toDTO);
      return HttpResponse.ok(dtos);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async getById(id: string): Promise<NextResponse> {
    try {
      const { getCatalogItemByIdUseCase } = this.getUseCases();
      const result = await getCatalogItemByIdUseCase.execute(id);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = CatalogItemMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = UpdateCatalogItemSchema.parse(body);

      const { updateCatalogItemUseCase } = this.getUseCases();
      const result = await updateCatalogItemUseCase.execute(id, validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = CatalogItemMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async delete(id: string): Promise<NextResponse> {
    try {
      const { deleteCatalogItemUseCase } = this.getUseCases();
      const result = await deleteCatalogItemUseCase.execute(id);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      return HttpResponse.noContent();
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }
}
