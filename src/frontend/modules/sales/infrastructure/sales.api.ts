import { HttpClient } from '@/src/frontend/shared/infrastructure/http-client';
import {
  SaleItem,
  PaginatedSalesResponse,
  SaleFilter,
  CreateSalePayload,
} from '../domain/sales.types';

export async function fetchSales(filters?: SaleFilter): Promise<PaginatedSalesResponse> {
  const params = new URLSearchParams();

  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.itemType && filters.itemType !== 'ALL') {
    params.append('itemType', filters.itemType);
  }
  if (filters?.clientId) params.append('clientId', filters.clientId);
  if (filters?.workerId) params.append('workerId', filters.workerId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const query = params.toString() ? `?${params.toString()}` : '';
  return HttpClient.get<PaginatedSalesResponse>(`/api/shopping${query}`);
}

export async function fetchSaleById(id: string): Promise<SaleItem> {
  return HttpClient.get<SaleItem>(`/api/shopping/${id}`);
}

export async function createSale(payload: CreateSalePayload): Promise<SaleItem> {
  return HttpClient.post<SaleItem>('/api/shopping', payload);
}
