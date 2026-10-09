'use client';

import { Phone } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { WhatsAppConversation } from '@/src/frontend/modules/whatsapp/domain';

interface WhatsAppConversationItemProps {
  conversation: WhatsAppConversation;
  isSelected: boolean;
  onSelect: (conversation: WhatsAppConversation) => void;
}

export function WhatsAppConversationItem({
  conversation,
  isSelected,
  onSelect,
}: WhatsAppConversationItemProps) {
  const initial = conversation.customerName
    ? conversation.customerName.charAt(0).toUpperCase()
    : 'C';

  const formattedDate = new Date(conversation.lastMessageAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={`w-full text-left p-3.5 transition-all flex items-start gap-3 hover:bg-muted/60 ${isSelected ? 'bg-spa-rose/10 border-l-4 border-spa-rose' : ''
        }`}
    >
      {/* Avatar with initial & unread indicator */}
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-spa-rose/25 to-spa-blush/30 text-spa-rose font-bold text-xs border border-spa-rose/20">
          {initial}
        </div>
        {conversation.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-spa-rose text-[9px] font-bold text-white px-1 shadow-sm">
            {conversation.unreadCount}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-xs font-semibold text-foreground truncate">
            {conversation.customerName}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
          <Phone className="h-2.5 w-2.5 text-spa-rose shrink-0" />
          <span className="truncate">+{conversation.customerPhone}</span>
          {conversation.workerId && (
            <Badge
              variant="outline"
              className="text-[9px] py-0 px-1 border-muted-foreground/30 text-muted-foreground font-mono"
            >
              W: {conversation.workerId.slice(0, 6)}
            </Badge>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground truncate">
          {conversation.lastMessageText || 'Sin contenido'}
        </p>
      </div>
    </button>
  );
}
