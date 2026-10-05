import { HttpClient } from '@/src/frontend/shared/infrastructure/http-client';
import { RegisterClientFormValues, ClientItem } from '../domain/client.types';

export async function createClient(
  businessId: string,
  values: RegisterClientFormValues
): Promise<ClientItem> {
  // Sanitize empty strings to null or undefined
  const payload = {
    ...values,
    businessId,
    primaryWorkerId: values.primaryWorkerId || null,
    email: values.email?.trim() || null,
    identificationNumber: values.identificationNumber?.trim() || null,
    birthDate: values.birthDate || null,
    notes: values.notes?.trim() || null,
  };

  return HttpClient.post<ClientItem>(`/api/businesses/${businessId}/clients`, payload);
}

export async function getClientsByBusiness(businessId: string): Promise<ClientItem[]> {
  return HttpClient.get<ClientItem[]>(`/api/businesses/${businessId}/clients`);
}

export async function getClientById(id: string): Promise<ClientItem> {
  return HttpClient.get<ClientItem>(`/api/clients/${id}`);
}

export const ClientsApi = {
  createClient,
  getClientsByBusiness,
  getClientById,
};
