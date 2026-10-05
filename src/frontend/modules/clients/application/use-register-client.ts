'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../infrastructure/clients.api';
import { RegisterClientFormValues, ClientItem } from '../domain/client.types';

export function useRegisterClient() {
  const queryClient = useQueryClient();

  return useMutation<ClientItem, Error, { businessId: string; values: RegisterClientFormValues }>({
    mutationFn: ({ businessId, values }) => createClient(businessId, values),
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries so tables & metrics immediately reflect the new client
      queryClient.invalidateQueries({ queryKey: ['businessClients', variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ['businessClients'] });
    },
  });
}
