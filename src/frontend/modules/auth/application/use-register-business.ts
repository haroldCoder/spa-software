'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthApi } from '../infrastructure/auth.api';
import { RegisterBusinessFormValues, AuthSessionResponse } from '../domain/auth.types';

export function useRegisterBusiness() {
  const queryClient = useQueryClient();

  return useMutation<AuthSessionResponse, Error, RegisterBusinessFormValues>({
    mutationFn: (values) => AuthApi.registerBusiness(values),
    onSuccess: (data) => {
      // Invalidate or update user query in cache
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });
}
