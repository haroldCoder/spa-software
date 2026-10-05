import { SupabaseClient } from '@supabase/supabase-js';
import {
  ICatalogStorageService,
  UploadCatalogImageParams,
} from '../../domain/services/catalog-storage.service.interface';
import { DatabaseError } from '@/src/shared/domain/errors';

export class SupabaseCatalogStorageService implements ICatalogStorageService {
  private readonly bucketName = 'products';

  constructor(private readonly client: SupabaseClient) {}

  public async uploadImage(params: UploadCatalogImageParams): Promise<string> {
    await this.ensureBucketExists();

    const sanitizedFileName = this.sanitizeFileName(params.fileName);
    const uniquePrefix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const filePath = `${params.businessId}/${uniquePrefix}-${sanitizedFileName}`;

    const { error: uploadError } = await this.client.storage
      .from(this.bucketName)
      .upload(filePath, params.file, {
        contentType: params.contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new DatabaseError(
        `Error al subir la imagen del producto/servicio a Supabase Storage: ${uploadError.message}`,
        uploadError
      );
    }

    return this.getPublicUrl(filePath);
  }

  public async deleteImage(imageUrl: string): Promise<void> {
    const filePath = this.extractFilePathFromUrl(imageUrl);
    if (!filePath) return;

    const { error } = await this.client.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new DatabaseError(
        `Error al eliminar la imagen del catálogo en Supabase Storage: ${error.message}`,
        error
      );
    }
  }

  public getPublicUrl(filePath: string): string {
    const { data } = this.client.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const { data: bucket } = await this.client.storage.getBucket(this.bucketName);
      if (!bucket) {
        await this.client.storage.createBucket(this.bucketName, {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024, // 10MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/avif',
            'image/svg+xml',
          ],
        });
      }
    } catch {
      // If bucket already exists or permissions don't allow creating, proceed silently
    }
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-');
  }

  private extractFilePathFromUrl(imageUrl: string): string | null {
    try {
      // URL format: https://<project>.supabase.co/storage/v1/object/public/products/<filePath>
      const marker = `/${this.bucketName}/`;
      const index = imageUrl.indexOf(marker);
      if (index === -1) return null;
      return imageUrl.substring(index + marker.length);
    } catch {
      return null;
    }
  }
}
