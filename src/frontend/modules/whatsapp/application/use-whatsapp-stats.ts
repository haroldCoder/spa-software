'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WhatsAppStats } from '../domain/whatsapp.types';
import { WHATSAPP_POLLING_INTERVAL_MS } from '../domain/whatsapp.constants';
import { IWhatsAppApi } from '../infrastructure/whatsapp.api.interface';
import { whatsAppApi } from '../infrastructure/whatsapp.api';

export interface UseWhatsAppStatsOptions {
  isAutoRefresh?: boolean;
  api?: IWhatsAppApi;
}

export function useWhatsAppStats(options?: UseWhatsAppStatsOptions) {
  const api = options?.api || whatsAppApi;
  const isAutoRefresh = options?.isAutoRefresh ?? false;
  const queryClient = useQueryClient();

  const query = useQuery<WhatsAppStats | null, Error>({
    queryKey: ['whatsapp-stats'],
    queryFn: () => api.getStats(),
    refetchInterval: isAutoRefresh ? WHATSAPP_POLLING_INTERVAL_MS : false,
    staleTime: 3000,
  });

  const clearMutation = useMutation<boolean, Error, void>({
    mutationFn: () => api.clearData(),
    onSuccess: () => {
      // Invalidate all related caches
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-stats'] });
    },
  });

  return {
    stats: query.data ?? null,
    isLoadingStats: query.isLoading,
    isClearing: clearMutation.isPending,
    refetchStats: query.refetch,
    clearData: async () => {
      return clearMutation.mutateAsync();
    },
  };
}
