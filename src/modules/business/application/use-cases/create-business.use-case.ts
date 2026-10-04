import { IBusinessRepository } from '../../domain/repositories/business.repository.interface';
import { Business } from '../../domain/entities/business.entity';
import { CreateBusinessDTO } from '../dtos/business.dto';
import { Result } from '@/src/shared/domain/result';
import { ConflictError, DomainError, BadRequestError } from '@/src/shared/domain/errors';

export class CreateBusinessUseCase {
  constructor(private readonly businessRepository: IBusinessRepository) {}

  public async execute(dto: CreateBusinessDTO): Promise<Result<Business, DomainError>> {
    try {
      const existing = await this.businessRepository.findByEmail(dto.email);
      if (existing) {
        return Result.fail(new ConflictError(`Ya existe un negocio registrado con el email '${dto.email}'.`));
      }

      let passwordHash: string | null = null;
      if (dto.password) {
        const bcrypt = await import('bcryptjs');
        passwordHash = await bcrypt.default.hash(dto.password, 10);
      }

      const business = Business.create({
        name: dto.name,
        legalName: dto.legalName,
        taxId: dto.taxId,
        email: dto.email,
        passwordHash,
        role: 'BUSINESS_OWNER',
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        currency: dto.currency,
        isActive: true,
      });

      const saved = await this.businessRepository.save(business);
      return Result.ok(saved);
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al crear el negocio'));
    }
  }
}
