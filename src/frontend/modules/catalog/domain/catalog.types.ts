import { SPA_CATALOG_CATEGORIES } from "./constants/catalog-categories";
import { CatalogItemType, ServiceType } from "./enums/catalog-item-type.enum";

export { CatalogItemType, ServiceType };

export interface CatalogItem {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  itemType: CatalogItemType;
  category: string;
  price: number;
  costPrice: number | null;
  durationMinutes: number | null;
  sku: string | null;
  barcode: string | null;
  stockQuantity: number;
  minStockThreshold: number | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogItemInput {
  name: string;
  description?: string;
  itemType: CatalogItemType;
  category: string;
  price: number;
  costPrice?: number;
  durationMinutes?: number;
  sku?: string;
  barcode?: string;
  stockQuantity?: number;
  minStockThreshold?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UploadImageResponse {
  imageUrl: string;
  publicUrl?: string;
  fileName?: string;
  filePath?: string;
  bucket?: string;
  fileSize?: number;
  mimeType?: string;
}

export type SpaCatalogCategory = (typeof SPA_CATALOG_CATEGORIES)[number];
