export interface UploadCatalogImageParams {
  file: Buffer | Uint8Array;
  fileName: string;
  contentType: string;
  businessId: string;
}

export interface ICatalogStorageService {
  uploadImage(params: UploadCatalogImageParams): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
  getPublicUrl(filePath: string): string;
}
