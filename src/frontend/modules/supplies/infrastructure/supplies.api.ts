import { HttpClient } from '@/src/frontend/shared/infrastructure/http-client';
import {
  SupplyItem,
  SuppliesSummary,
  PaginatedSuppliesResponse,
  SupplyFilter,
  CreateSupplyPayload,
  UpdateSupplyPayload,
  RegisterMovementPayload,
} from '../domain/supplies.types';

export async function fetchSupplies(
  businessId: string,
  filters?: SupplyFilter
): Promise<PaginatedSuppliesResponse> {
  const params = new URLSearchParams();
  params.append('businessId', businessId);

  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.itemType && filters.itemType !== 'ALL') {
    params.append('itemType', filters.itemType);
  }
  if (filters?.category) params.append('category', filters.category);
  if (filters?.lowStockOnly) params.append('lowStockOnly', 'true');
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.search) params.append('search', filters.search);

  const query = `?${params.toString()}`;
  return HttpClient.get<PaginatedSuppliesResponse>(`/api/supplies${query}`);
}

export async function fetchSuppliesSummary(businessId: string): Promise<SuppliesSummary> {
  return HttpClient.get<SuppliesSummary>(`/api/supplies/summary?businessId=${encodeURIComponent(businessId)}`);
}

export async function fetchSupplyById(id: string): Promise<SupplyItem> {
  return HttpClient.get<SupplyItem>(`/api/supplies/${id}`);
}

export async function createSupply(payload: CreateSupplyPayload): Promise<SupplyItem> {
  return HttpClient.post<SupplyItem>('/api/supplies', payload);
}

export async function updateSupply(
  id: string,
  payload: UpdateSupplyPayload
): Promise<SupplyItem> {
  return HttpClient.put<SupplyItem>(`/api/supplies/${id}`, payload);
}

export async function deleteSupply(id: string): Promise<void> {
  return HttpClient.delete<void>(`/api/supplies/${id}`);
}

export async function registerSupplyMovement(
  supplyId: string,
  payload: RegisterMovementPayload
): Promise<{ movement: unknown; updatedSupply: SupplyItem }> {
  return HttpClient.post<{ movement: unknown; updatedSupply: SupplyItem }>(
    `/api/supplies/${supplyId}/movements`,
    payload
  );
}
