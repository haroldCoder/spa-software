import { IClientRepository } from '../../domain/repositories/client.repository.interface';
import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { UpdateClientDTO } from '../dtos/client.dto';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, BadRequestError } from '@/src/shared/domain/errors';

export class UpdateClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly workerRepository: IWorkerRepository
  ) {}

  public async execute(id: string, dto: UpdateClientDTO): Promise<Result<Client, DomainError>> {
    try {
      const client = await this.clientRepository.findById(id);
      if (!client) {
        return Result.fail(new NotFoundError('Cliente', id));
      }

      if (dto.primaryWorkerId !== undefined && dto.primaryWorkerId !== null) {
        const worker = await this.workerRepository.findById(dto.primaryWorkerId);
        if (!worker) {
          return Result.fail(new NotFoundError('Trabajadora', dto.primaryWorkerId));
        }
        if (worker.businessId !== client.businessId) {
          return Result.fail(new BadRequestError('La trabajadora no pertenece al mismo negocio del cliente.'));
        }
      }

      client.update(dto);
      const updated = await this.clientRepository.update(client);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : `Error al actualizar el cliente con id '${id}'`));
    }
  }
}
