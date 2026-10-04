'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, logout } from '../infrastructure/auth.api';

export function useCurrentUser() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.invalidateQueries();
      window.location.href = '/login';
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
