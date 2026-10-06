import { HttpClient } from '@/src/frontend/shared/infrastructure/http-client';
import {
  AppointmentFilters,
  AppointmentItem,
  AppointmentStatus,
  PaginatedAppointmentsResponse,
} from '../domain/appointment.types';

export async function getAppointments(
  filters: AppointmentFilters
): Promise<PaginatedAppointmentsResponse> {
  const params = new URLSearchParams();

  params.set('page', String(filters.page || 1));
  params.set('limit', String(filters.limit || 10));

  if (filters.status && filters.status !== 'ALL') {
    params.set('status', filters.status);
  }

  if (filters.workerId && filters.workerId !== 'ALL') {
    params.set('workerId', filters.workerId);
  }

  if (filters.clientId) {
    params.set('clientId', filters.clientId);
  }

  if (filters.serviceId) {
    params.set('serviceId', filters.serviceId);
  }

  if (filters.startDate) {
    params.set('startDate', filters.startDate);
  }

  if (filters.endDate) {
    params.set('endDate', filters.endDate);
  }

  const endpoint = `/api/appointments?${params.toString()}`;
  return HttpClient.get<PaginatedAppointmentsResponse>(endpoint);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  cancellationReason?: string
): Promise<AppointmentItem> {
  return HttpClient.patch<AppointmentItem>(`/api/appointments/${id}/status`, {
    status,
    cancellationReason: cancellationReason || undefined,
  });
}

export const AppointmentsApi = {
  getAppointments,
  updateAppointmentStatus,
};
