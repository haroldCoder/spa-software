import { HttpClient } from '@/src/frontend/shared/infrastructure/http-client';
import { AuthSessionResponse } from '@/src/frontend/modules/auth/domain/auth.types';
import {
  BusinessProfile,
  BusinessWorkerItem,
  BusinessClientItem,
} from '../domain/dashboard.types';

export async function getCurrentUser(): Promise<AuthSessionResponse['user']> {
  return HttpClient.get<AuthSessionResponse['user']>('/api/auth/me');
}

export async function getBusinessProfile(businessId: string): Promise<BusinessProfile> {
  return HttpClient.get<BusinessProfile>(`/api/businesses/${businessId}`);
}

export async function getBusinessWorkers(businessId: string): Promise<BusinessWorkerItem[]> {
  return HttpClient.get<BusinessWorkerItem[]>(`/api/businesses/${businessId}/workers`);
}

export async function getBusinessClients(businessId: string): Promise<BusinessClientItem[]> {
  return HttpClient.get<BusinessClientItem[]>(`/api/businesses/${businessId}/clients`);
}

export const DashboardApi = {
  getCurrentUser,
  getBusinessProfile,
  getBusinessWorkers,
  getBusinessClients,
};
