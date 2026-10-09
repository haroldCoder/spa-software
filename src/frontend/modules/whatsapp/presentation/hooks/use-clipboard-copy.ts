'use client';

import { useState, useCallback } from 'react';

export function useClipboardCopy(resetDelayMs = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, key = 'default') => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => {
          setCopiedKey((prev) => (prev === key ? null : prev));
        }, resetDelayMs);
        return true;
      } catch (err) {
        console.error('[useClipboardCopy] Failed to copy text:', err);
        return false;
      }
    },
    [resetDelayMs]
  );

  const isCopied = useCallback(
    (key = 'default') => copiedKey === key,
    [copiedKey]
  );

  return {
    copiedKey,
    copy,
    isCopied,
  };
}
