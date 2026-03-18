'use client';

import { formatDateTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  timestamp: string;
  title: string;
  description?: string;
  actor?: string;
  color?: string;
}

const dotColorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  orange: 'bg-amber-500',
  gray: 'bg-slate-400',
};

interface TimelineViewProps {
  events: TimelineEvent[];
}

export function TimelineView({ events }: TimelineViewProps) {
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />

      <div className="space-y-6">
        {events.map((event, i) => (
          <div key={i} className="relative">
            {/* Dot */}
            <div
              className={cn(
                'absolute -left-6 top-1.5 w-[14px] h-[14px] rounded-full border-2 border-white',
                dotColorMap[event.color ?? 'blue'] ?? dotColorMap.blue,
              )}
            />
            <div>
              <div className="text-sm font-semibold text-slate-800">{event.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {formatDateTime(event.timestamp)}
                {event.actor && ` — ${event.actor}`}
              </div>
              {event.description && (
                <div className="text-[13px] text-slate-600 mt-1">{event.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
