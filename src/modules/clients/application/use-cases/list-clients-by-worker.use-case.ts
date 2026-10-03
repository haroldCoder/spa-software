import { IClientRepository } from '../../domain/repositories/client.repository.interface';
import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError } from '@/src/shared/domain/errors';

export class ListClientsByWorkerUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly workerRepository: IWorkerRepository
  ) {}

  public async execute(workerId: string, filter?: { isActive?: boolean }): Promise<Result<Client[], DomainError>> {
    try {
      const worker = await this.workerRepository.findById(workerId);
      if (!worker) {
        return Result.fail(new NotFoundError('Trabajadora', workerId));
      }

      const clients = await this.clientRepository.findByWorkerId(workerId, filter);
      return Result.ok(clients);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new NotFoundError('Trabajadora', workerId));
    }
  }
}
