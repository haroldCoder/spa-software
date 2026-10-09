'use client';

import { MessageSquare, RefreshCw } from 'lucide-react';
import { Card } from '@/src/components/ui/card';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { WhatsAppConversation } from '@/src/frontend/modules/whatsapp/domain';
import { WhatsAppConversationSearch } from './whatsapp-conversation-search';
import { WhatsAppConversationItem } from './whatsapp-conversation-item';

interface WhatsAppConversationListProps {
  conversations: WhatsAppConversation[];
  selectedConversation: WhatsAppConversation | null;
  onSelectConversation: (conversation: WhatsAppConversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
  isAutoRefresh: boolean;
}

export function WhatsAppConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  isLoading,
  isAutoRefresh,
}: WhatsAppConversationListProps) {
  return (
    <Card className="md:col-span-5 lg:col-span-4 flex flex-col h-full bg-card border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Search Header */}
      <div className="p-3.5 border-b border-border bg-card/90 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Chats Capturados ({conversations.length})
          </span>
          {isAutoRefresh && (
            <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En vivo (3m)
            </span>
          )}
        </div>
        <WhatsAppConversationSearch value={searchQuery} onChange={onSearchChange} />
      </div>

      {/* Conversations ScrollArea */}
      <ScrollArea className="flex-1">
        {isLoading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin text-spa-rose mb-2" />
            <p>Cargando conversaciones...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/30" />
            <p className="font-semibold text-foreground">No hay mensajes capturados aún</p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Asegúrate de que la extensión del navegador esté enviando los datos al webhook o envía una prueba.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {conversations.map((conv) => (
              <WhatsAppConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversation?.id === conv.id}
                onSelect={onSelectConversation}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
