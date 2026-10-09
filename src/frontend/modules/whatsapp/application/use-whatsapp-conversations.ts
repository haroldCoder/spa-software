'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WhatsAppConversation } from '../domain/whatsapp.types';
import { WHATSAPP_POLLING_INTERVAL_MS } from '../domain/whatsapp.constants';
import { IWhatsAppApi } from '../infrastructure/whatsapp.api.interface';
import { whatsAppApi } from '../infrastructure/whatsapp.api';

export interface UseWhatsAppConversationsOptions {
  businessId?: string;
  workerId?: string;
  isAutoRefresh?: boolean;
  api?: IWhatsAppApi;
}

export function useWhatsAppConversations(options?: UseWhatsAppConversationsOptions) {
  const api = options?.api || whatsAppApi;
  const businessId = options?.businessId;
  const workerId = options?.workerId;
  const isAutoRefresh = options?.isAutoRefresh ?? false;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);

  const query = useQuery<WhatsAppConversation[], Error>({
    queryKey: ['whatsapp-conversations', { searchQuery, businessId, workerId }],
    queryFn: () =>
      api.getConversations({
        searchQuery: searchQuery.trim() || undefined,
        businessId,
        workerId,
      }),
    refetchInterval: isAutoRefresh ? WHATSAPP_POLLING_INTERVAL_MS : false,
    staleTime: 2000,
  });

  const conversations = query.data ?? [];

  // Keep selectedConversation reference synchronized with the latest data
  const activeSelectedConversation = selectedConversation
    ? conversations.find((c) => c.id === selectedConversation.id) || selectedConversation
    : null;

  return {
    conversations,
    selectedConversation: activeSelectedConversation,
    setSelectedConversation,
    searchQuery,
    setSearchQuery,
    isLoadingConversations: query.isLoading,
    isFetching: query.isFetching,
    lastUpdated: new Date(query.dataUpdatedAt),
    refetchConversations: query.refetch,
  };
}
