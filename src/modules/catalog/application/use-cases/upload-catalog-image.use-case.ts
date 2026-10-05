import { ICatalogStorageService } from '../../domain/services/catalog-storage.service.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, BadRequestError } from '@/src/shared/domain/errors';

export interface UploadCatalogImageDTO {
  businessId: string;
  file: Buffer | Uint8Array;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface UploadCatalogImageResult {
  imageUrl: string;
  publicUrl: string;
  fileName: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

export class UploadCatalogImageUseCase {
  constructor(
    private readonly catalogStorageService: ICatalogStorageService,
    private readonly businessRepository: IBusinessRepository
  ) { }

  public async execute(
    dto: UploadCatalogImageDTO
  ): Promise<Result<UploadCatalogImageResult, DomainError>> {
    try {
      if (!dto.businessId) {
        return Result.fail(new BadRequestError('El businessId es obligatorio para subir una imagen.'));
      }

      const business = await this.businessRepository.findById(dto.businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio', dto.businessId));
      }

      if (!dto.file || dto.file.length === 0) {
        return Result.fail(new BadRequestError('El archivo de imagen no puede estar vacío.'));
      }

      if (!ALLOWED_MIME_TYPES.includes(dto.mimeType.toLowerCase())) {
        return Result.fail(
          new BadRequestError(
            `Tipo de archivo no permitido: '${dto.mimeType}'. Formatos soportados: JPG, PNG, WEBP, GIF, AVIF.`
          )
        );
      }

      if (dto.fileSize > MAX_FILE_SIZE) {
        return Result.fail(
          new BadRequestError('El tamaño de la imagen supera el límite permitido de 10MB.')
        );
      }

      const imageUrl = await this.catalogStorageService.uploadImage({
        businessId: dto.businessId,
        file: dto.file,
        fileName: dto.fileName,
        contentType: dto.mimeType,
      });

      return Result.ok({
        imageUrl,
        publicUrl: imageUrl,
        fileName: dto.fileName,
      });
    } catch (error) {
      if (error instanceof DomainError) return Result.fail(error);
      return Result.fail(
        new BadRequestError(
          error instanceof Error
            ? error.message
            : 'Error inesperado al subir la imagen del catálogo'
        )
      );
    }
  }
}
