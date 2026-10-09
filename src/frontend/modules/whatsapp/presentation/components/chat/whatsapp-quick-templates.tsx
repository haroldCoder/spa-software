'use client';

import { Sparkles } from 'lucide-react';
import { QuickMessageTemplate, DEFAULT_QUICK_TEMPLATES } from '@/src/frontend/modules/whatsapp/domain';

interface WhatsAppQuickTemplatesProps {
  customerName?: string;
  onSelectTemplate: (text: string) => void;
  templates?: QuickMessageTemplate[];
}

export function WhatsAppQuickTemplates({
  customerName = '',
  onSelectTemplate,
  templates = DEFAULT_QUICK_TEMPLATES,
}: WhatsAppQuickTemplatesProps) {
  if (templates.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t border-border/60 bg-muted/30 overflow-x-auto scrollbar-none flex items-center gap-2">
      <span className="text-[10px] font-medium text-muted-foreground shrink-0 flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-spa-rose" />
        Plantillas:
      </span>

      {templates.map((tpl) => (
        <button
          key={tpl.id}
          type="button"
          onClick={() => onSelectTemplate(tpl.text(customerName))}
          className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-background border border-border/80 hover:border-spa-rose/50 hover:bg-spa-rose/5 text-muted-foreground hover:text-foreground transition-all"
        >
          {tpl.label}
        </button>
      ))}
    </div>
  );
}
