import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { SupabaseWorkerRepository } from '../../infrastructure/repositories/supabase-worker.repository';
import { SupabaseBusinessRepository } from '@/src/modules/business/infrastructure/repositories/supabase-business.repository';
import { CreateWorkerUseCase } from '../../application/use-cases/create-worker.use-case';
import { GetWorkerByIdUseCase } from '../../application/use-cases/get-worker-by-id.use-case';
import { ListWorkersByBusinessUseCase } from '../../application/use-cases/list-workers-by-business.use-case';
import { UpdateWorkerUseCase } from '../../application/use-cases/update-worker.use-case';
import { CreateWorkerSchema, UpdateWorkerSchema } from '../../application/dtos/worker.dto';
import { WorkerMapper } from '../../infrastructure/mappers/worker.mapper';
import { HttpResponse } from '@/src/shared/presentation/http-response';

export class WorkerController {
  private static getUseCases() {
    const supabase = getSupabaseServerClient();
    const workerRepo = new SupabaseWorkerRepository(supabase);
    const businessRepo = new SupabaseBusinessRepository(supabase);

    return {
      createWorkerUseCase: new CreateWorkerUseCase(workerRepo, businessRepo),
      getWorkerByIdUseCase: new GetWorkerByIdUseCase(workerRepo),
      listWorkersByBusinessUseCase: new ListWorkersByBusinessUseCase(workerRepo, businessRepo),
      updateWorkerUseCase: new UpdateWorkerUseCase(workerRepo),
    };
  }

  public static async create(request: NextRequest, businessIdFromParams?: string): Promise<NextResponse> {
    try {
      const body = await request.json();
      const payload = {
        ...body,
        businessId: businessIdFromParams || body.businessId,
      };

      const validatedData = CreateWorkerSchema.parse(payload);
      const { createWorkerUseCase } = this.getUseCases();
      const result = await createWorkerUseCase.execute(validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = WorkerMapper.toDTO(result.getValue());
      return HttpResponse.created(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async listByBusiness(businessId: string, request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const activeParam = searchParams.get('isActive');
      const isActive = activeParam !== null ? activeParam === 'true' : undefined;

      const { listWorkersByBusinessUseCase } = this.getUseCases();
      const result = await listWorkersByBusinessUseCase.execute(businessId, { isActive });

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dtos = result.getValue().map(WorkerMapper.toDTO);
      return HttpResponse.ok(dtos);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async getById(id: string): Promise<NextResponse> {
    try {
      const { getWorkerByIdUseCase } = this.getUseCases();
      const result = await getWorkerByIdUseCase.execute(id);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = WorkerMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = UpdateWorkerSchema.parse(body);

      const { updateWorkerUseCase } = this.getUseCases();
      const result = await updateWorkerUseCase.execute(id, validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = WorkerMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }
}
