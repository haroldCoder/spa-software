'use client';

import { useQuery } from '@tanstack/react-query';
import { WhatsAppConversation, WhatsAppMessage } from '../domain/whatsapp.types';
import { WHATSAPP_POLLING_INTERVAL_MS, WHATSAPP_QUERY_STALE_TIME_MS } from '../domain/whatsapp.constants';
import { IWhatsAppApi } from '../infrastructure/whatsapp.api.interface';
import { whatsAppApi } from '../infrastructure/whatsapp.api';

export interface UseWhatsAppMessagesOptions {
  selectedConversation: WhatsAppConversation | null;
  businessId?: string;
  workerId?: string;
  isAutoRefresh?: boolean;
  api?: IWhatsAppApi;
}

export function useWhatsAppMessages({
  selectedConversation,
  isAutoRefresh = false,
  api = whatsAppApi,
}: UseWhatsAppMessagesOptions) {
  const conversationId = selectedConversation?.id;

  const query = useQuery<WhatsAppMessage[], Error>({
    queryKey: ['whatsapp-messages', conversationId],
    queryFn: () => (conversationId ? api.getMessages(conversationId) : Promise.resolve([])),
    enabled: Boolean(conversationId),
    initialData:
      selectedConversation?.messages && selectedConversation.messages.length > 0
        ? selectedConversation.messages
        : undefined,
    refetchInterval: isAutoRefresh && Boolean(conversationId) ? WHATSAPP_POLLING_INTERVAL_MS : false,
    staleTime: WHATSAPP_QUERY_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  return {
    messages: query.data ?? [],
    isLoadingMessages: query.isLoading,
    refetchMessages: query.refetch,
  };
}
