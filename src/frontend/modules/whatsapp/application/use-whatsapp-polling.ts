'use client';

import { useState, useEffect } from 'react';
import { WHATSAPP_POLLING_INTERVAL_MS } from '../domain/whatsapp.constants';

export interface UseWhatsAppPollingOptions {
  onPoll: () => Promise<void> | void;
  intervalMs?: number;
  initialEnabled?: boolean;
}

export function useWhatsAppPolling({
  onPoll,
  intervalMs = WHATSAPP_POLLING_INTERVAL_MS,
  initialEnabled = true,
}: UseWhatsAppPollingOptions) {
  const [isAutoRefresh, setIsAutoRefresh] = useState(initialEnabled);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      onPoll();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isAutoRefresh, onPoll, intervalMs]);

  return {
    isAutoRefresh,
    setIsAutoRefresh,
  };
}
