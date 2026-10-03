import { IClientRepository } from '../../domain/repositories/client.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { CreateClientDTO } from '../dtos/client.dto';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, BadRequestError } from '@/src/shared/domain/errors';

export class CreateClientUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly businessRepository: IBusinessRepository,
    private readonly workerRepository: IWorkerRepository
  ) {}

  public async execute(dto: CreateClientDTO): Promise<Result<Client, DomainError>> {
    try {
      const business = await this.businessRepository.findById(dto.businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', dto.businessId));
      }

      if (dto.primaryWorkerId) {
        const worker = await this.workerRepository.findById(dto.primaryWorkerId);
        if (!worker) {
          return Result.fail(new NotFoundError('Trabajadora asignada', dto.primaryWorkerId));
        }
        if (worker.businessId !== dto.businessId) {
          return Result.fail(new BadRequestError('La trabajadora asignada no pertenece a este negocio.'));
        }
      }

      const client = Client.create({
        businessId: dto.businessId,
        primaryWorkerId: dto.primaryWorkerId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        identificationNumber: dto.identificationNumber,
        birthDate: dto.birthDate,
        notes: dto.notes,
        isActive: true,
      });

      const saved = await this.clientRepository.save(client);
      return Result.ok(saved);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al registrar el cliente'));
    }
  }
}
