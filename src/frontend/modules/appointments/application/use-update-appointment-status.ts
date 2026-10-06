'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppointmentStatus } from '../infrastructure/appointments.api';
import { AppointmentItem, AppointmentStatus } from '../domain/appointment.types';

export interface UpdateStatusPayload {
  id: string;
  status: AppointmentStatus;
  cancellationReason?: string;
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation<AppointmentItem, Error, UpdateStatusPayload>({
    mutationFn: ({ id, status, cancellationReason }) =>
      updateAppointmentStatus(id, status, cancellationReason),
    onSuccess: (updatedAppointment) => {
      // Invalidate all appointment queries to refresh tables and stats
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
