'use client';

import { useEffect, useRef } from 'react';

export function useChatScroll<T>(dependencies: T[], shouldSmooth = true) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: shouldSmooth ? 'smooth' : 'auto',
    });
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return { bottomRef };
}
