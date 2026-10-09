'use client';

import { Phone, ExternalLink, Copy, Check } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { WhatsAppConversation } from '@/src/frontend/modules/whatsapp/domain';
import { useClipboardCopy } from '@/src/frontend/modules/whatsapp/presentation/hooks';

interface WhatsAppChatHeaderProps {
  conversation: WhatsAppConversation;
}

export function WhatsAppChatHeader({ conversation }: WhatsAppChatHeaderProps) {
  const { copy, isCopied } = useClipboardCopy();
  const initial = conversation.customerName
    ? conversation.customerName.charAt(0).toUpperCase()
    : 'C';

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-spa-rose/30 to-spa-blush/40 text-spa-rose font-bold text-sm shadow-sm border border-spa-rose/25">
          {initial}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">
              {conversation.customerName}
            </h4>
            <Badge
              variant="outline"
              className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-0 px-1.5 font-medium"
            >
              Capturado
            </Badge>
            {conversation.workerId && (
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 font-mono text-muted-foreground bg-muted/40"
              >
                Trabajadora: {conversation.workerId}
              </Badge>
            )}
            {conversation.businessId && (
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 font-mono text-muted-foreground bg-muted/40"
              >
                Negocio: {conversation.businessId}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            <Phone className="h-3 w-3 text-spa-rose" />
            <span>+{conversation.customerPhone}</span>
            <button
              type="button"
              onClick={() => copy(conversation.customerPhone, 'phone')}
              className="hover:text-foreground text-muted-foreground transition-colors p-0.5"
              title="Copiar número"
            >
              {isCopied('phone') ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`https://web.whatsapp.com/send?phone=${conversation.customerPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-spa-rose hover:bg-spa-rose/10 border border-spa-rose/20 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Abrir en WhatsApp Web</span>
        </a>
      </div>
    </div>
  );
}
