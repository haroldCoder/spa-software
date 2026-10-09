'use client';

import { MessageSquare } from 'lucide-react';

export function WhatsAppEmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center p-8 bg-muted/10 border border-dashed border-border rounded-2xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-spa-rose/10 text-spa-rose mb-4 shadow-inner">
        <MessageSquare className="h-8 w-8 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-serif font-bold text-foreground mb-1">
        Bandeja de WhatsApp
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm">
        Selecciona una conversación del listado lateral para ver el historial de mensajes capturados por la extensión o enviar respuestas locales.
      </p>
    </div>
  );
}
