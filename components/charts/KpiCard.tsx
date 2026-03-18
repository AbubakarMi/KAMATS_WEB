'use client';

import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  trendColor?: string;
  iconColor?: string;
  iconBg?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

function Sparkline({ color, seed = 0 }: { color: string; seed?: number }) {
  const points = useMemo(() => {
    // Generate a simple pseudo-random sparkline based on seed
    const pts: number[] = [];
    let val = 40 + (seed * 7) % 20;
    for (let i = 0; i < 8; i++) {
      val += ((seed + i * 13) % 17) - 8;
      val = Math.max(10, Math.min(55, val));
      pts.push(val);
    }
    return pts;
  }, [seed]);

  const width = 80;
  const height = 40;
  const stepX = width / (points.length - 1);

  const pathData = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${height - y}`)
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-60">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiCard({
  title,
  value,
  suffix,
  trend,
  trendValue,
  trendColor,
  iconColor = '#6366F1',
  iconBg = '#EEF2FF',
  icon,
  onClick,
  loading,
}: KpiCardProps) {
  const resolvedColor =
    trendColor ||
    (trend === 'up' ? '#16A34A' :
    trend === 'down' ? '#DC2626' :
    '#78716C');

  const sparkColor =
    trendColor || iconColor || '#6366F1';

  return (
    <div
      onClick={onClick}
      className={cn(
        'h-full rounded-2xl bg-white p-5 transition-all duration-300',
        'shadow-[var(--k-shadow-card)] hover:shadow-[var(--k-shadow-card-hover)]',
        'border border-stone-100/80',
        onClick && 'cursor-pointer',
      )}
    >
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            {icon && (
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: iconBg }}
              >
                {icon}
              </div>
            )}
            <Sparkline color={sparkColor} seed={typeof value === 'number' ? value : title.length} />
          </div>
          <span className="k-label block mb-1.5">{title}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold font-[family-name:var(--font-display)] text-stone-900 tracking-[-0.02em] leading-none">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix && (
              <span className="text-sm font-medium text-stone-400">{suffix}</span>
            )}
          </div>
          {trend && trendValue && (
            <div
              className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
              style={{
                background: `${resolvedColor}12`,
                color: resolvedColor,
              }}
            >
              <span>{trendValue}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
