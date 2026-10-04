'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthApi } from '../infrastructure/auth.api';
import { RegisterWorkerFormValues, AuthSessionResponse } from '../domain/auth.types';

export function useRegisterWorker() {
  const queryClient = useQueryClient();

  return useMutation<AuthSessionResponse, Error, RegisterWorkerFormValues>({
    mutationFn: (values) => AuthApi.registerWorker(values),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });
}
