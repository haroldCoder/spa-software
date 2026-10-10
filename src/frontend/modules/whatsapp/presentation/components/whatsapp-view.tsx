'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';
import { useWhatsApp } from '../../application/use-whatsapp';
import { WhatsAppHeader } from './header/whatsapp-header';
import { WhatsAppHeaderActions } from './header/whatsapp-header-actions';
import { WhatsAppWebhookBanner } from './webhook/whatsapp-webhook-banner';
import { WhatsAppConversationList } from './conversation-list/whatsapp-conversation-list';
import { WhatsAppChatWindow } from './chat/whatsapp-chat-window';

export function WhatsAppView() {
  const { user } = useCurrentUser();
  const [filterOnlyMine, setFilterOnlyMine] = useState(false);

  const isWorker = user?.userType === 'WORKER' || user?.role === 'WORKER';

  // Si está autenticado como colaboradora, consulta exclusivamente sus chats asignados (workerId = user.id)
  // Si está autenticado como dueña/administradora, consulta por businessId y permite filtrar opcionalmente por worker
  const activeBusinessId = user?.businessId;
  const activeWorkerId = isWorker
    ? user?.id
    : filterOnlyMine && user?.id
    ? user.id
    : undefined;

  const {
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
    refresh,
    clearAllData,
  } = useWhatsApp({
    businessId: activeBusinessId,
    workerId: activeWorkerId,
  });

  const handleClearDataWithConfirm = async () => {
    if (!confirm('¿Estás seguro de que deseas vaciar las conversaciones de prueba en el servidor local?')) {
      return;
    }
    await clearAllData();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Action Controls */}
      <WhatsAppHeader>
        <WhatsAppHeaderActions
          hasUser={Boolean(user)}
          isWorker={isWorker}
          userName={user?.name}
          filterOnlyMine={filterOnlyMine}
          onToggleFilterOnlyMine={() => setFilterOnlyMine((prev) => !prev)}
          isAutoRefresh={isAutoRefresh}
          onToggleAutoRefresh={() => setIsAutoRefresh((prev) => !prev)}
          onRefresh={refresh}
          onClearData={handleClearDataWithConfirm}
          isClearing={isClearing}
          hasConversations={conversations.length > 0}
        />
      </WhatsAppHeader>

      {/* 2. Webhook Integration Status & Guide Banner */}
      <WhatsAppWebhookBanner
        stats={stats}
        totalConversations={conversations.length}
        businessId={user?.businessId}
        workerId={user?.id}
      />

      {/* 3. Main Workspace: Split View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[calc(100vh-280px)] min-h-[600px]">
        {/* Left Panel: Conversation List (4 columns) */}
        <WhatsAppConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoadingConversations}
          isAutoRefresh={isAutoRefresh}
        />

        {/* Right Panel: Chat Window (7-8 columns) */}
        <div className="md:col-span-7 lg:col-span-8 h-full min-h-0">
          <WhatsAppChatWindow
            conversation={selectedConversation}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
          />
        </div>
      </div>
    </div>
  );
}
