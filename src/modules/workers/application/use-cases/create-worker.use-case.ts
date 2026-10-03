import { IWorkerRepository } from '../../domain/repositories/worker.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { Worker } from '../../domain/entities/worker.entity';
import { CreateWorkerDTO } from '../dtos/worker.dto';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, BadRequestError } from '@/src/shared/domain/errors';

export class CreateWorkerUseCase {
  constructor(
    private readonly workerRepository: IWorkerRepository,
    private readonly businessRepository: IBusinessRepository
  ) {}

  public async execute(dto: CreateWorkerDTO): Promise<Result<Worker, DomainError>> {
    try {
      const business = await this.businessRepository.findById(dto.businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', dto.businessId));
      }

      const worker = Worker.create({
        businessId: dto.businessId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        specialty: dto.specialty,
        commissionPercentage: dto.commissionPercentage,
        isActive: true,
      });

      const saved = await this.workerRepository.save(worker);
      return Result.ok(saved);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al crear la trabajadora'));
    }
  }
}
