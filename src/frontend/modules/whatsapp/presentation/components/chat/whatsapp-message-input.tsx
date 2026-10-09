'use client';

import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

interface WhatsAppMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isSending: boolean;
  disabled?: boolean;
}

export function WhatsAppMessageInput({
  value,
  onChange,
  onSubmit,
  isSending,
  disabled = false,
}: WhatsAppMessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const isDisabled = disabled || isSending || !value.trim();

  return (
    <form onSubmit={onSubmit} className="p-3 sm:p-4 border-t border-border bg-card flex items-center gap-2">
      <Input
        placeholder="Escribe una respuesta para esta conversación..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSending || disabled}
        className="text-xs h-11 bg-background/90"
      />
      <Button
        type="submit"
        disabled={isDisabled}
        className="h-11 px-4 bg-spa-rose hover:bg-spa-rose/90 text-white shrink-0 rounded-xl shadow-sm gap-1.5"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-semibold">Responder</span>
          </>
        )}
      </Button>
    </form>
  );
}
