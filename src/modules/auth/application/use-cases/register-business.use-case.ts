import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { Business } from '@/src/modules/business/domain/entities/business.entity';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import { ITokenService } from '../../domain/services/token-service.interface';
import { IAuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface';
import { AuthSession } from '../../domain/entities/auth-session.entity';
import { RegisterBusinessInputDTO, AuthResponseDTO } from '../dtos/auth.dto';
import { Result } from '@/src/shared/domain/result';
import { ConflictError, DomainError, BadRequestError } from '@/src/shared/domain/errors';

export interface ClientMetadata {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class RegisterBusinessUseCase {
  constructor(
    private readonly businessRepository: IBusinessRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly sessionRepository: IAuthSessionRepository
  ) {}

  public async execute(
    dto: RegisterBusinessInputDTO,
    metadata?: ClientMetadata
  ): Promise<Result<AuthResponseDTO, DomainError>> {
    try {
      const existing = await this.businessRepository.findByEmail(dto.email);
      if (existing) {
        return Result.fail(new ConflictError(`Ya existe un spa o negocio registrado con el email '${dto.email}'.`));
      }

      const passwordHash = await this.passwordHasher.hash(dto.password);

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

      const savedBusiness = await this.businessRepository.save(business);
      if (!savedBusiness.id) {
        return Result.fail(new BadRequestError('No se pudo generar el ID del negocio.'));
      }

      // Create session
      const sessionToken = this.tokenService.generateSessionToken();
      const refreshToken = this.tokenService.generateRefreshToken();
      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const session = AuthSession.create({
        userId: savedBusiness.id,
        userType: 'BUSINESS',
        businessId: savedBusiness.id,
        sessionToken,
        refreshToken,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        expiresAt: sessionExpiresAt,
      });

      const savedSession = await this.sessionRepository.create(session);

      // Generate JWT Access Token
      const accessToken = await this.tokenService.generateAccessToken({
        userId: savedBusiness.id,
        businessId: savedBusiness.id,
        email: savedBusiness.email,
        name: savedBusiness.name,
        role: 'BUSINESS_OWNER',
        userType: 'BUSINESS',
        sessionId: savedSession.id ?? sessionToken,
      });

      return Result.ok({
        user: {
          id: savedBusiness.id,
          businessId: savedBusiness.id,
          email: savedBusiness.email,
          name: savedBusiness.name,
          role: 'BUSINESS_OWNER',
          userType: 'BUSINESS',
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '2h',
          tokenType: 'Bearer',
        },
        session: {
          id: savedSession.id ?? sessionToken,
          expiresAt: sessionExpiresAt.toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(new BadRequestError(error instanceof Error ? error.message : 'Error al registrar el spa'));
    }
  }
}
