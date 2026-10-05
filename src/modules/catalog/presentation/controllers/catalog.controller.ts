import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { SupabaseCatalogRepository } from '../../infrastructure/repositories/supabase-catalog.repository';
import { SupabaseBusinessRepository } from '@/src/modules/business/infrastructure/repositories/supabase-business.repository';
import { SupabaseCatalogStorageService } from '../../infrastructure/services/supabase-catalog-storage.service';
import { CreateCatalogItemUseCase } from '../../application/use-cases/create-catalog-item.use-case';
import { GetCatalogItemByIdUseCase } from '../../application/use-cases/get-catalog-item-by-id.use-case';
import { ListCatalogByBusinessUseCase } from '../../application/use-cases/list-catalog-by-business.use-case';
import { UpdateCatalogItemUseCase } from '../../application/use-cases/update-catalog-item.use-case';
import { DeleteCatalogItemUseCase } from '../../application/use-cases/delete-catalog-item.use-case';
import { UploadCatalogImageUseCase } from '../../application/use-cases/upload-catalog-image.use-case';
import { CreateCatalogItemSchema, UpdateCatalogItemSchema } from '../../application/dtos/catalog-item.dto';
import { CatalogItemMapper } from '../../infrastructure/mappers/catalog-item.mapper';
import { CatalogItemType } from '../../domain/entities/catalog-item.entity';
import { HttpResponse } from '@/src/shared/presentation/http-response';
import { authenticateRequest } from '@/src/modules/auth/presentation/middlewares/auth.guard';

export class CatalogController {
  private static getUseCases() {
    const supabase = getSupabaseServerClient();
    const catalogRepo = new SupabaseCatalogRepository(supabase);
    const businessRepo = new SupabaseBusinessRepository(supabase);
    const storageService = new SupabaseCatalogStorageService(supabase);

    return {
      storageService,
      createCatalogItemUseCase: new CreateCatalogItemUseCase(catalogRepo, businessRepo),
      getCatalogItemByIdUseCase: new GetCatalogItemByIdUseCase(catalogRepo),
      listCatalogByBusinessUseCase: new ListCatalogByBusinessUseCase(catalogRepo, businessRepo),
      updateCatalogItemUseCase: new UpdateCatalogItemUseCase(catalogRepo),
      deleteCatalogItemUseCase: new DeleteCatalogItemUseCase(catalogRepo),
      uploadCatalogImageUseCase: new UploadCatalogImageUseCase(storageService, businessRepo),
    };
  }

  public static async uploadImage(request: NextRequest, businessIdFromParams?: string): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);

      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const businessId =
        businessIdFromParams ||
        (formData.get('businessId') as string) ||
        auth.user.businessId;

      if (!businessId) {
        return HttpResponse.badRequest('Se requiere el ID del negocio (businessId) para subir la imagen.');
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden('No tienes permisos para subir archivos al catálogo de otro negocio.');
      }

      if (!file) {
        return HttpResponse.badRequest('No se ha proporcionado ningún archivo de imagen en el campo "file".');
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const { uploadCatalogImageUseCase } = this.getUseCases();

      const result = await uploadCatalogImageUseCase.execute({
        businessId,
        file: buffer,
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        fileSize: file.size,
      });

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      return HttpResponse.created(result.getValue());
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async create(request: NextRequest, businessIdFromParams?: string): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);

      const body = await request.json();
      const businessId = businessIdFromParams || body.businessId || auth.user.businessId;

      if (!businessId) {
        return HttpResponse.badRequest('Se requiere el ID del negocio (businessId) para crear el artículo.');
      }

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden('No tienes permisos para crear artículos en el catálogo de otro negocio.');
      }

      const payload = {
        ...body,
        businessId,
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
      const auth = await authenticateRequest(request);

      if (auth.user.businessId !== businessId) {
        return HttpResponse.forbidden('No tienes permisos para consultar el catálogo de otro negocio.');
      }

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

  public static async getById(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);

      const { getCatalogItemByIdUseCase } = this.getUseCases();
      const result = await getCatalogItemByIdUseCase.execute(id);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const item = result.getValue();
      if (auth.user.businessId !== item.businessId) {
        return HttpResponse.forbidden('No tienes permisos para consultar este artículo del catálogo.');
      }

      const dto = CatalogItemMapper.toDTO(item);
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);

      const { getCatalogItemByIdUseCase, updateCatalogItemUseCase } = this.getUseCases();

      const existingResult = await getCatalogItemByIdUseCase.execute(id);
      if (existingResult.isFailure) {
        return HttpResponse.handleDomainError(existingResult.getError());
      }

      const existingItem = existingResult.getValue();
      if (auth.user.businessId !== existingItem.businessId) {
        return HttpResponse.forbidden('No tienes permisos para modificar este artículo del catálogo.');
      }

      const body = await request.json();
      const validatedData = UpdateCatalogItemSchema.parse(body);

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

  public static async delete(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const auth = await authenticateRequest(request);

      const { getCatalogItemByIdUseCase, deleteCatalogItemUseCase } = this.getUseCases();

      const existingResult = await getCatalogItemByIdUseCase.execute(id);
      if (existingResult.isFailure) {
        return HttpResponse.handleDomainError(existingResult.getError());
      }

      const existingItem = existingResult.getValue();
      if (auth.user.businessId !== existingItem.businessId) {
        return HttpResponse.forbidden('No tienes permisos para eliminar este artículo del catálogo.');
      }

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
