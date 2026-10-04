'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerBusiness } from '../infrastructure/auth.api';
import { RegisterBusinessFormValues, AuthSessionResponse } from '../domain/auth.types';

export function useRegisterBusiness() {
  const queryClient = useQueryClient();

  return useMutation<AuthSessionResponse, Error, RegisterBusinessFormValues>({
    mutationFn: (values) => registerBusiness(values),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });
}
