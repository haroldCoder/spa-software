'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointment } from '../infrastructure/appointments.api';
import { AppointmentItem, CreateAppointmentPayload } from '../domain/appointment.types';

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation<AppointmentItem, Error, CreateAppointmentPayload>({
    mutationFn: (payload) => createAppointment(payload),
    onSuccess: () => {
      // Refresh all appointments list and calendar queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
