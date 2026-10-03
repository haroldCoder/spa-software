import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { SupabaseBusinessRepository } from '../../infrastructure/repositories/supabase-business.repository';
import { CreateBusinessUseCase } from '../../application/use-cases/create-business.use-case';
import { GetBusinessByIdUseCase } from '../../application/use-cases/get-business-by-id.use-case';
import { ListBusinessesUseCase } from '../../application/use-cases/list-businesses.use-case';
import { UpdateBusinessUseCase } from '../../application/use-cases/update-business.use-case';
import { CreateBusinessSchema, UpdateBusinessSchema } from '../../application/dtos/business.dto';
import { BusinessMapper } from '../../infrastructure/mappers/business.mapper';
import { HttpResponse } from '@/src/shared/presentation/http-response';

export class BusinessController {
  private static getUseCases() {
    const supabase = getSupabaseServerClient();
    const repository = new SupabaseBusinessRepository(supabase);
    return {
      createBusinessUseCase: new CreateBusinessUseCase(repository),
      getBusinessByIdUseCase: new GetBusinessByIdUseCase(repository),
      listBusinessesUseCase: new ListBusinessesUseCase(repository),
      updateBusinessUseCase: new UpdateBusinessUseCase(repository),
    };
  }

  public static async create(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = CreateBusinessSchema.parse(body);

      const { createBusinessUseCase } = this.getUseCases();
      const result = await createBusinessUseCase.execute(validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = BusinessMapper.toDTO(result.getValue());
      return HttpResponse.created(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async list(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const activeParam = searchParams.get('isActive');
      const isActive = activeParam !== null ? activeParam === 'true' : undefined;

      const { listBusinessesUseCase } = this.getUseCases();
      const result = await listBusinessesUseCase.execute({ isActive });

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dtos = result.getValue().map(BusinessMapper.toDTO);
      return HttpResponse.ok(dtos);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async getById(id: string): Promise<NextResponse> {
    try {
      const { getBusinessByIdUseCase } = this.getUseCases();
      const result = await getBusinessByIdUseCase.execute(id);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = BusinessMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = UpdateBusinessSchema.parse(body);

      const { updateBusinessUseCase } = this.getUseCases();
      const result = await updateBusinessUseCase.execute(id, validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = BusinessMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }
}
