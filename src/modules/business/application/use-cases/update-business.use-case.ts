import { IBusinessRepository } from '../../domain/repositories/business.repository.interface';
import { Business } from '../../domain/entities/business.entity';
import { UpdateBusinessDTO } from '../dtos/business.dto';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, BadRequestError } from '@/src/shared/domain/errors';

export class UpdateBusinessUseCase {
  constructor(private readonly businessRepository: IBusinessRepository) {}

  public async execute(id: string, dto: UpdateBusinessDTO): Promise<Result<Business, DomainError>> {
    try {
      const business = await this.businessRepository.findById(id);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', id));
      }

      business.update(dto);
      const updated = await this.businessRepository.update(business);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : `Error al actualizar el negocio con id '${id}'`));
    }
  }
}
