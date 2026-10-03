import { IClientRepository } from '../../domain/repositories/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError } from '@/src/shared/domain/errors';

export class GetClientByIdUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  public async execute(id: string): Promise<Result<Client, DomainError>> {
    try {
      const client = await this.clientRepository.findById(id);
      if (!client) {
        return Result.fail(new NotFoundError('Cliente', id));
      }
      return Result.ok(client);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new NotFoundError('Cliente', id));
    }
  }
}
