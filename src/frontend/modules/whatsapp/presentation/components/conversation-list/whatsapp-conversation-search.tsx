'use client';

import { Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';

interface WhatsAppConversationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function WhatsAppConversationSearch({
  value,
  onChange,
  placeholder = 'Buscar por nombre, número o mensaje...',
}: WhatsAppConversationSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 text-xs h-9 bg-background/90"
      />
    </div>
  );
}
