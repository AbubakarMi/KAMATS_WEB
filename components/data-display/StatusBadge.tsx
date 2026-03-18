'use client';

import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/utils/statusColors';
import { cn } from '@/lib/utils';

// Maps old antd color presets to Tailwind classes
const colorClassMap: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-indigo-50 text-indigo-600',
  orange: 'bg-amber-50 text-amber-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  purple: 'bg-purple-50 text-purple-600',
  magenta: 'bg-pink-50 text-pink-600',
  geekblue: 'bg-indigo-50 text-indigo-600',
  default: 'bg-stone-100 text-stone-500',
};

function formatLabel(status: string): string {
  return status.replace(/([A-Z])/g, ' $1').trim();
}

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const color = getStatusColor(status);
  const classes = colorClassMap[color] ?? colorClassMap.default;

  return (
    <Badge
      variant="secondary"
      className={cn('inline-flex items-center gap-1.5 font-medium text-xs', classes)}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {label || formatLabel(status)}
    </Badge>
  );
}
