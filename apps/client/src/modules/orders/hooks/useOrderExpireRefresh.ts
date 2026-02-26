'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useOrderExpireRefresh() {
  const router = useRouter();
  const firedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const onExpire = useCallback(() => {
    if (firedRef.current) {
      return;
    }
    firedRef.current = true;

    // 1) immediate refresh
    router.refresh();

    // 2) one delayed refresh to catch eventual consistency
    timeoutRef.current = window.setTimeout(() => {
      router.refresh();
    }, 1500);
  }, [router]);

  // optional cleanup if component unmounts
  const cleanup = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  return { onExpire, cleanup };
}
