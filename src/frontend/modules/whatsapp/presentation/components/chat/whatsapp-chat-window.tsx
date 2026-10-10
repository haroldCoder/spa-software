'use client';

import React from 'react';
import {
  WhatsAppConversation,
  WhatsAppMessage,
} from '@/src/frontend/modules/whatsapp/domain';
import { WhatsAppEmptyChat } from './whatsapp-empty-chat';
import { WhatsAppChatHeader } from './whatsapp-chat-header';
import { WhatsAppMessageList } from './whatsapp-message-list';

export interface WhatsAppChatWindowProps {
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[];
  isLoadingMessages: boolean;
}

export function WhatsAppChatWindow({
  conversation,
  messages,
  isLoadingMessages,
}: WhatsAppChatWindowProps) {
  if (!conversation) {
    return <WhatsAppEmptyChat />;
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* 1. Header with Contact Info */}
      <WhatsAppChatHeader conversation={conversation} />

      {/* 2. Messages Timeline with ScrollArea */}
      <WhatsAppMessageList
        messages={messages}
        isLoading={isLoadingMessages}
        customerName={conversation.customerName}
      />

      {/* 3. Read-Only Indicator */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border/50 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-2 select-none shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Recepción activa &middot; Las respuestas se gestionan directamente desde WhatsApp</span>
      </div>
    </div>
  );
}
