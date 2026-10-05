import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { SupabaseClientRepository } from '../../infrastructure/repositories/supabase-client.repository';
import { SupabaseBusinessRepository } from '@/src/modules/business/infrastructure/repositories/supabase-business.repository';
import { SupabaseWorkerRepository } from '@/src/modules/workers/infrastructure/repositories/supabase-worker.repository';
import { CreateClientUseCase } from '../../application/use-cases/create-client.use-case';
import { GetClientByIdUseCase } from '../../application/use-cases/get-client-by-id.use-case';
import { ListClientsByWorkerUseCase } from '../../application/use-cases/list-clients-by-worker.use-case';
import { ListClientsByBusinessUseCase } from '../../application/use-cases/list-clients-by-business.use-case';
import { UpdateClientUseCase } from '../../application/use-cases/update-client.use-case';
import { CreateClientSchema, UpdateClientSchema } from '../../application/dtos/client.dto';
import { ClientMapper } from '../../infrastructure/mappers/client.mapper';
import { HttpResponse } from '@/src/shared/presentation/http-response';

export class ClientController {
  private static getUseCases() {
    const supabase = getSupabaseServerClient();
    const clientRepo = new SupabaseClientRepository(supabase);
    const businessRepo = new SupabaseBusinessRepository(supabase);
    const workerRepo = new SupabaseWorkerRepository(supabase);

    return {
      createClientUseCase: new CreateClientUseCase(clientRepo, businessRepo, workerRepo),
      getClientByIdUseCase: new GetClientByIdUseCase(clientRepo),
      listClientsByWorkerUseCase: new ListClientsByWorkerUseCase(clientRepo, workerRepo),
      listClientsByBusinessUseCase: new ListClientsByBusinessUseCase(clientRepo, businessRepo),
      updateClientUseCase: new UpdateClientUseCase(clientRepo, workerRepo),
    };
  }

  public static async create(
    request: NextRequest,
    workerIdFromParams?: string,
    businessIdFromParams?: string
  ): Promise<NextResponse> {
    try {
      const body = await request.json();
      const payload = {
        ...body,
        businessId: businessIdFromParams || body.businessId,
        primaryWorkerId: workerIdFromParams || body.primaryWorkerId,
      };

      const validatedData = CreateClientSchema.parse(payload);
      const { createClientUseCase } = this.getUseCases();
      const result = await createClientUseCase.execute(validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = ClientMapper.toDTO(result.getValue());
      return HttpResponse.created(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async listByWorker(workerId: string, request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const activeParam = searchParams.get('isActive');
      const isActive = activeParam !== null ? activeParam === 'true' : undefined;

      const { listClientsByWorkerUseCase } = this.getUseCases();
      const result = await listClientsByWorkerUseCase.execute(workerId, { isActive });

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dtos = result.getValue().map(ClientMapper.toDTO);
      return HttpResponse.ok(dtos);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async listByBusiness(businessId: string, request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const activeParam = searchParams.get('isActive');
      const isActive = activeParam !== null ? activeParam === 'true' : undefined;

      const { listClientsByBusinessUseCase } = this.getUseCases();
      const result = await listClientsByBusinessUseCase.execute(businessId, { isActive });

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dtos = result.getValue().map(ClientMapper.toDTO);
      return HttpResponse.ok(dtos);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async getById(id: string): Promise<NextResponse> {
    try {
      const { getClientByIdUseCase } = this.getUseCases();
      const result = await getClientByIdUseCase.execute(id);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = ClientMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = UpdateClientSchema.parse(body);

      const { updateClientUseCase } = this.getUseCases();
      const result = await updateClientUseCase.execute(id, validatedData);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const dto = ClientMapper.toDTO(result.getValue());
      return HttpResponse.ok(dto);
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }
}
