'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WhatsAppConversation, WhatsAppMessage } from '../domain/whatsapp.types';
import { WHATSAPP_POLLING_INTERVAL_MS, WHATSAPP_QUERY_STALE_TIME_MS } from '../domain/whatsapp.constants';
import { IWhatsAppApi } from '../infrastructure/whatsapp.api.interface';
import { whatsAppApi } from '../infrastructure/whatsapp.api';

export interface UseWhatsAppMessagesOptions {
  selectedConversation: WhatsAppConversation | null;
  isAutoRefresh?: boolean;
  api?: IWhatsAppApi;
  onMessageSent?: () => Promise<void> | void;
}

export function useWhatsAppMessages({
  selectedConversation,
  isAutoRefresh = false,
  api = whatsAppApi,
  onMessageSent,
}: UseWhatsAppMessagesOptions) {
  const queryClient = useQueryClient();
  const conversationId = selectedConversation?.id;

  const query = useQuery<WhatsAppMessage[], Error>({
    queryKey: ['whatsapp-messages', conversationId],
    queryFn: () => (conversationId ? api.getMessages(conversationId) : Promise.resolve([])),
    enabled: Boolean(conversationId),
    refetchInterval: isAutoRefresh && Boolean(conversationId) ? WHATSAPP_POLLING_INTERVAL_MS : false,
    staleTime: WHATSAPP_QUERY_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const sendMutation = useMutation<WhatsAppMessage, Error, string>({
    mutationFn: async (content: string) => {
      if (!selectedConversation) throw new Error('No hay conversación seleccionada.');
      return api.sendMessage({
        conversationId: selectedConversation.id,
        content: content.trim(),
        businessId: selectedConversation.businessId,
        workerId: selectedConversation.workerId,
      });
    },
    onSuccess: (newMessage) => {
      // Optimistically update message cache
      queryClient.setQueryData<WhatsAppMessage[]>(
        ['whatsapp-messages', conversationId],
        (prev) => (prev ? [...prev, newMessage] : [newMessage])
      );
      // Invalidate conversations to update lastMessageText and lastMessageAt
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });

      if (onMessageSent) {
        onMessageSent();
      }
    },
  });

  return {
    messages: query.data ?? [],
    isLoadingMessages: query.isLoading,
    isSending: sendMutation.isPending,
    refetchMessages: query.refetch,
    sendMessage: async (content: string) => {
      await sendMutation.mutateAsync(content);
    },
  };
}
