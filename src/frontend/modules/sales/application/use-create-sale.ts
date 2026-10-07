'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSale } from '../infrastructure/sales.api';
import { CreateSalePayload, SaleItem } from '../domain/sales.types';

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation<SaleItem, Error, CreateSalePayload>({
    mutationFn: (payload) => createSale(payload),
    onSuccess: () => {
      // Invalidate sales and catalog queries so stock and sales list refresh automatically
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['businessProducts'] });
      queryClient.invalidateQueries({ queryKey: ['catalogItems'] });
    },
  });
}
