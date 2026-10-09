'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

interface WhatsAppHeaderProps {
  children?: React.ReactNode;
}

export function WhatsAppHeader({ children }: WhatsAppHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
            WhatsApp Webhook Receptor
          </h1>
          <p className="text-xs text-muted-foreground">
            Captura local de contactos y mensajes en tiempo real desde la extensión del navegador
          </p>
        </div>
      </div>

      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
