'use client';

import { useEffect, useState, type ReactNode } from 'react';

export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_MSW !== 'true') {
      setReady(true);
      return;
    }

    import('@/mocks/browser').then(({ worker }) => {
      worker
        .start({ onUnhandledRequest: 'bypass' })
        .then(() => {
          console.log('[MSW] Mock Service Worker started successfully');
          setReady(true);
        })
        .catch((err: unknown) => {
          console.error('[MSW] Failed to start Mock Service Worker:', err);
          setReady(true);
        });
    });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
