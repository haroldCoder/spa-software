'use client';

import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../infrastructure/appointments.api';
import {
  AppointmentFilters,
  PaginatedAppointmentsResponse,
} from '../domain/appointment.types';

export function useAppointments(filters: AppointmentFilters) {
  const query = useQuery<PaginatedAppointmentsResponse, Error>({
    queryKey: ['appointments', filters],
    queryFn: () => getAppointments(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    data: query.data,
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? filters.page ?? 1,
    limit: query.data?.limit ?? filters.limit ?? 10,
    totalPages: query.data?.totalPages ?? 1,
    hasNextPage: query.data?.hasNextPage ?? false,
    hasPrevPage: query.data?.hasPrevPage ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
