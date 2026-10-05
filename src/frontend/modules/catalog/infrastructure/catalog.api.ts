import { HttpClient } from '@/src/frontend/shared/infrastructure/http-client';
import {
  CatalogItem,
  CatalogItemType,
  CreateCatalogItemInput,
  UploadImageResponse,
} from '../domain/catalog.types';

export interface CatalogFilterOptions {
  itemType?: CatalogItemType;
  category?: string;
  isActive?: boolean;
}

export async function fetchCatalogItems(
  businessId: string,
  filters?: CatalogFilterOptions
): Promise<CatalogItem[]> {
  const params = new URLSearchParams();
  if (filters?.itemType) params.append('itemType', filters.itemType);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

  const query = params.toString() ? `?${params.toString()}` : '';
  return HttpClient.get<CatalogItem[]>(`/api/businesses/${businessId}/catalog${query}`);
}

export async function uploadCatalogImage(
  businessId: string,
  file: File
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('businessId', businessId);

  return HttpClient.post<UploadImageResponse>(
    `/api/businesses/${businessId}/catalog/upload`,
    formData
  );
}

export async function createCatalogItem(
  businessId: string,
  data: CreateCatalogItemInput
): Promise<CatalogItem> {
  const payload = {
    ...data,
    businessId,
    description: data.description?.trim() || null,
    sku: data.sku?.trim() || null,
    barcode: data.barcode?.trim() || null,
    cost: data.costPrice !== undefined ? Number(data.costPrice) : 0,
    costPrice: data.costPrice !== undefined ? Number(data.costPrice) : null,
    durationMinutes: data.durationMinutes !== undefined ? Number(data.durationMinutes) : null,
    stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : 0,
    minStockThreshold: data.minStockThreshold !== undefined ? Number(data.minStockThreshold) : null,
    imageUrl: data.imageUrl || null,
  };

  return HttpClient.post<CatalogItem>(`/api/businesses/${businessId}/catalog`, payload);
}

export async function deleteCatalogItem(id: string): Promise<void> {
  return HttpClient.delete<void>(`/api/catalog/${id}`);
}

export const CatalogApi = {
  fetchCatalogItems,
  uploadCatalogImage,
  createCatalogItem,
  deleteCatalogItem,
};
