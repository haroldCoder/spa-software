'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../infrastructure/auth.api';
import { LoginFormValues, AuthSessionResponse } from '../domain/auth.types';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthSessionResponse, Error, LoginFormValues>({
    mutationFn: (values) => login(values),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });
}
