import { IWorkerRepository } from '../../domain/repositories/worker.repository.interface';
import { Worker } from '../../domain/entities/worker.entity';
import { UpdateWorkerDTO } from '../dtos/worker.dto';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, BadRequestError } from '@/src/shared/domain/errors';
import bcrypt from 'bcryptjs';

export class UpdateWorkerUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  public async execute(id: string, dto: UpdateWorkerDTO): Promise<Result<Worker, DomainError>> {
    try {
      const worker = await this.workerRepository.findById(id);
      if (!worker) {
        return Result.fail(new NotFoundError('Trabajadora', id));
      }

      const updateData: Partial<Parameters<typeof worker.update>[0]> = { ...dto };
      if (dto.password) {
        updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      }

      worker.update(updateData);
      const updated = await this.workerRepository.update(worker);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : `Error al actualizar la trabajadora con id '${id}'`));
    }
  }
}

