'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  Clock,
  Building,
  UserCheck,
} from 'lucide-react';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { WHATSAPP_API_ENDPOINTS, WhatsAppStats } from '@/src/frontend/modules/whatsapp/domain';
import { useClipboardCopy } from '@/src/frontend/modules/whatsapp/presentation/hooks';
import { WhatsAppWebhookGuide } from './whatsapp-webhook-guide';

interface WhatsAppWebhookBannerProps {
  stats: WhatsAppStats | null;
  totalConversations: number;
  businessId?: string;
  workerId?: string;
}

export function WhatsAppWebhookBanner({
  stats,
  totalConversations,
  businessId,
  workerId,
}: WhatsAppWebhookBannerProps) {
  const [showGuide, setShowGuide] = useState(false);
  const { copy, isCopied } = useClipboardCopy();

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${WHATSAPP_API_ENDPOINTS.WEBHOOK}`
      : process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_URL as string;

  return (
    <Card className="p-4 sm:p-5 bg-card/60 backdrop-blur border-border/80 rounded-2xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Indicator & Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-foreground">
              Webhook Escuchando Peticiones
            </span>
            <Badge variant="secondary" className="text-[10px] py-0 px-2 font-mono">
              POST /api/whatsapp/webhook
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              Conversaciones: <strong className="text-foreground">{stats?.totalConversations ?? totalConversations}</strong>
            </span>
            <span>•</span>
            <span>
              Mensajes guardados: <strong className="text-foreground">{stats?.totalMessages ?? 0}</strong>
            </span>
            {stats?.lastWebhookReceivedAt && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Última recepción: {new Date(stats.lastWebhookReceivedAt).toLocaleTimeString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action & Copy Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copy(webhookUrl, 'webhook')}
            className="text-xs gap-1.5 h-8 rounded-xl font-mono text-[11px]"
          >
            {isCopied('webhook') ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>¡URL Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar URL Webhook</span>
              </>
            )}
          </Button>

          {businessId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(businessId, 'business')}
              className="text-xs gap-1.5 h-8 rounded-xl text-[11px]"
              title="Copiar ID de este negocio para configurar la extensión"
            >
              {isCopied('business') ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Building className="h-3.5 w-3.5 text-spa-rose" />
              )}
              <span>Copiar businessId</span>
            </Button>
          )}

          {workerId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(workerId, 'worker')}
              className="text-xs gap-1.5 h-8 rounded-xl text-[11px]"
              title="Copiar ID de esta colaboradora para configurar la extensión"
            >
              {isCopied('worker') ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <UserCheck className="h-3.5 w-3.5 text-spa-rose" />
              )}
              <span>Copiar workerId</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide((prev) => !prev)}
            className="text-xs gap-1 h-8 text-muted-foreground hover:text-foreground"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>{showGuide ? 'Ocultar Formato' : 'Ver Formato JSON'}</span>
            {showGuide ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {showGuide && (
        <WhatsAppWebhookGuide
          webhookUrl={webhookUrl}
          businessId={businessId}
          workerId={workerId}
        />
      )}
    </Card>
  );
}
