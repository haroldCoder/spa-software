'use client';

import { useState, useCallback } from 'react';
import {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppStats,
  WhatsAppConversationDTO,
  WhatsAppMessageDTO,
  WhatsAppStatsDTO,
} from '../domain/whatsapp.types';
import { IWhatsAppApi } from '../infrastructure/whatsapp.api.interface';
import { whatsAppApi } from '../infrastructure/whatsapp.api';
import { useWhatsAppConversations } from './use-whatsapp-conversations';
import { useWhatsAppMessages } from './use-whatsapp-messages';
import { useWhatsAppStats } from './use-whatsapp-stats';

export type {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppStats,
  WhatsAppConversationDTO,
  WhatsAppMessageDTO,
  WhatsAppStatsDTO,
};

export interface UseWhatsAppOptions {
  businessId?: string;
  workerId?: string;
  api?: IWhatsAppApi;
}

/**
 * Facade Hook: useWhatsApp
 * Composes focused sub-hooks (Conversations, Messages, Stats) powered by TanStack Query.
 */
export function useWhatsApp(options?: UseWhatsAppOptions) {
  const api = options?.api || whatsAppApi;
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // 1. Conversations management
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    searchQuery,
    setSearchQuery,
    isLoadingConversations,
    lastUpdated,
    refetchConversations,
  } = useWhatsAppConversations({
    businessId: options?.businessId,
    workerId: options?.workerId,
    isAutoRefresh,
    api,
  });

  // 2. Messages management
  const {
    messages,
    isLoadingMessages,
    refetchMessages,
  } = useWhatsAppMessages({
    selectedConversation,
    businessId: options?.businessId,
    workerId: options?.workerId,
    isAutoRefresh,
    api,
  });

  // 3. Stats management
  const { stats, isClearing, refetchStats, clearData } = useWhatsAppStats({
    isAutoRefresh,
    api,
  });

  // Manual refresh across all active queries
  const refresh = useCallback(() => {
    refetchConversations();
    refetchStats();
    if (selectedConversation) {
      refetchMessages();
    }
  }, [refetchConversations, refetchStats, refetchMessages, selectedConversation]);

  // Clear data handler with local selection reset
  const clearAllData = useCallback(async () => {
    const success = await clearData();
    if (success) {
      setSelectedConversation(null);
    }
    return success;
  }, [clearData, setSelectedConversation]);

  return {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    stats,
    searchQuery,
    setSearchQuery,
    isLoadingConversations,
    isLoadingMessages,
    isClearing,
    isAutoRefresh,
    setIsAutoRefresh,
    lastUpdated,
    refresh,
    clearAllData,
  };
}
