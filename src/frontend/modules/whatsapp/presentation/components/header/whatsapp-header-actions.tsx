'use client';

import { HardDrive, UserCheck, Radio, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';

interface WhatsAppHeaderActionsProps {
  hasUser: boolean;
  filterOnlyMine: boolean;
  onToggleFilterOnlyMine: () => void;
  isAutoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onClearData: () => void;
  isClearing: boolean;
  hasConversations: boolean;
}

export function WhatsAppHeaderActions({
  hasUser,
  filterOnlyMine,
  onToggleFilterOnlyMine,
  isAutoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  onClearData,
  isClearing,
  hasConversations,
}: WhatsAppHeaderActionsProps) {
  return (
    <>
      <Badge
        variant="outline"
        className="text-[11px] bg-muted/60 text-muted-foreground border-border gap-1 py-1 px-2.5"
      >
        <HardDrive className="h-3.5 w-3.5 text-spa-rose" />
        Servidor Local
      </Badge>

      {hasUser && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilterOnlyMine}
          className={`text-xs gap-1.5 h-9 rounded-xl transition-all ${filterOnlyMine
              ? 'border-spa-rose/40 bg-spa-rose/10 text-spa-rose'
              : 'text-muted-foreground'
            }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>{filterOnlyMine ? 'Mis Chats' : 'Todos los Chats'}</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onToggleAutoRefresh}
        className={`text-xs gap-1.5 h-9 rounded-xl transition-all ${isAutoRefresh
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
            : 'text-muted-foreground'
          }`}
      >
        <Radio className={`h-3.5 w-3.5 ${isAutoRefresh ? 'animate-pulse text-emerald-500' : ''}`} />
        <span>{isAutoRefresh ? 'Sincronización en Vivo' : 'Pausa Sincronización'}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="text-xs gap-1.5 h-9 rounded-xl"
        title="Refrescar lista"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Refrescar</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onClearData}
        disabled={isClearing || !hasConversations}
        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-9 rounded-xl"
        title="Vaciar datos locales de prueba"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Vaciar Pruebas</span>
      </Button>
    </>
  );
}
