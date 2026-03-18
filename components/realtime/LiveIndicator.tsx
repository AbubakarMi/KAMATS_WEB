'use client';

import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  connected: boolean;
  label?: string;
}

export function LiveIndicator({ connected, label = 'Live' }: LiveIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={cn(
          'relative h-2 w-2 rounded-full',
          connected ? 'bg-emerald-500' : 'bg-slate-300',
        )}
      >
        {connected && (
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
        )}
      </span>
      <span className={cn(connected ? 'text-slate-700' : 'text-slate-400')}>
        {connected ? label : 'Disconnected'}
      </span>
    </span>
  );
}
