'use client';

import React, { useState } from 'react';
import {
  WhatsAppConversation,
  WhatsAppMessage,
} from '@/src/frontend/modules/whatsapp/domain';
import { WhatsAppEmptyChat } from './whatsapp-empty-chat';
import { WhatsAppChatHeader } from './whatsapp-chat-header';
import { WhatsAppMessageList } from './whatsapp-message-list';
import { WhatsAppQuickTemplates } from './whatsapp-quick-templates';
import { WhatsAppMessageInput } from './whatsapp-message-input';

export interface WhatsAppChatWindowProps {
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[];
  isLoadingMessages: boolean;
  isSending: boolean;
  onSendMessage: (text: string) => Promise<void>;
}

export function WhatsAppChatWindow({
  conversation,
  messages,
  isLoadingMessages,
  isSending,
  onSendMessage,
}: WhatsAppChatWindowProps) {
  const [inputText, setInputText] = useState('');

  if (!conversation) {
    return <WhatsAppEmptyChat />;
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const handleSelectTemplate = (templateText: string) => {
    setInputText(templateText);
  };

  return (
    <div className="flex flex-col h-full min-h-[550px] bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* 1. Header */}
      <WhatsAppChatHeader conversation={conversation} />

      {/* 2. Messages Timeline */}
      <WhatsAppMessageList
        messages={messages}
        isLoading={isLoadingMessages}
        customerName={conversation.customerName}
      />

      {/* 3. Quick Responses Templates */}
      <WhatsAppQuickTemplates
        customerName={conversation.customerName}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* 4. Message Input Bar */}
      <WhatsAppMessageInput
        value={inputText}
        onChange={setInputText}
        onSubmit={handleSend}
        isSending={isSending}
      />
    </div>
  );
}
