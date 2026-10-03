import { IWorkerRepository } from '../../domain/repositories/worker.repository.interface';
import { Worker } from '../../domain/entities/worker.entity';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError } from '@/src/shared/domain/errors';

export class GetWorkerByIdUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  public async execute(id: string): Promise<Result<Worker, DomainError>> {
    try {
      const worker = await this.workerRepository.findById(id);
      if (!worker) {
        return Result.fail(new NotFoundError('Trabajadora', id));
      }
      return Result.ok(worker);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new NotFoundError('Trabajadora', id));
    }
  }
}
