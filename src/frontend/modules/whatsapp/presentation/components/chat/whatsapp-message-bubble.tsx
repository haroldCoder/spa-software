'use client';

import { CheckCheck } from 'lucide-react';
import { WhatsAppMessage } from '@/src/frontend/modules/whatsapp/domain';

interface WhatsAppMessageBubbleProps {
  message: WhatsAppMessage;
  customerName?: string;
}

export function WhatsAppMessageBubble({
  message,
  customerName,
}: WhatsAppMessageBubbleProps) {
  const isOutbound = message.direction === 'OUTBOUND';
  const senderDisplayName = isOutbound
    ? 'AuraSpa (Respuesta)'
    : message.senderName || customerName || 'Contacto';

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed transition-all ${isOutbound
            ? 'bg-spa-rose text-white rounded-br-none shadow-spa-rose/15'
            : 'bg-card text-foreground rounded-bl-none border border-border/80'
          }`}
      >
        {/* Header sender label & time */}
        <div
          className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between gap-4 ${isOutbound ? 'text-white/80' : 'text-spa-rose'
            }`}
        >
          <span>{senderDisplayName}</span>
          <span className="text-[9px] font-normal opacity-75">{formattedTime}</span>
        </div>

        {/* Message Content */}
        <div className="whitespace-pre-wrap break-words font-sans text-xs sm:text-[13px] leading-relaxed">
          {message.content}
        </div>

        {/* Status check for outbound messages */}
        {isOutbound && (
          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/80">
            <span>Enviado</span>
            <CheckCheck className="h-3 w-3 text-emerald-200" />
          </div>
        )}
      </div>
    </div>
  );
}
