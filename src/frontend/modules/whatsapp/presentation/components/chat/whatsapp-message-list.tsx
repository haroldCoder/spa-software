'use client';

import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { WhatsAppMessage } from '@/src/frontend/modules/whatsapp/domain';
import { useChatScroll } from '@/src/frontend/modules/whatsapp/presentation/hooks';
import { WhatsAppMessageBubble } from './whatsapp-message-bubble';

interface WhatsAppMessageListProps {
  messages: WhatsAppMessage[];
  isLoading: boolean;
  customerName?: string;
}

export function WhatsAppMessageList({
  messages,
  isLoading,
  customerName,
}: WhatsAppMessageListProps) {
  const { bottomRef } = useChatScroll([messages.length, isLoading]);

  return (
    <ScrollArea className="flex-1 p-4 sm:p-5 bg-gradient-to-b from-background/40 to-muted/20">
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-spa-rose" />
        </div>
      ) : messages.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          <p>No hay mensajes registrados en este chat aún.</p>
          <p className="mt-1">Los mensajes enviados por la extensión aparecerán aquí en vivo.</p>
        </div>
      ) : (
        <div className="space-y-3.5 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <WhatsAppMessageBubble
              key={msg.id}
              message={msg}
              customerName={customerName}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </ScrollArea>
  );
}
