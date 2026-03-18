'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface DetailPageSkeletonProps {
  hasKpiCards?: boolean;
  kpiCount?: number;
  descriptionRows?: number;
  hasTable?: boolean;
}

export function DetailPageSkeleton({
  hasKpiCards = false,
  kpiCount = 4,
  descriptionRows = 8,
  hasTable = false,
}: DetailPageSkeletonProps) {
  return (
    <div>
      {/* Back button + Title row */}
      <div className="mb-5">
        <Skeleton className="h-8 w-20 mb-3 rounded-lg" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-7 w-60 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Optional KPI cards */}
      {hasKpiCards && (
        <div
          className="grid gap-4 mb-4"
          style={{
            gridTemplateColumns: `repeat(${kpiCount}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: kpiCount }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-5 border border-stone-100/80 shadow-[var(--k-shadow-card)]"
            >
              <Skeleton className="h-11 w-11 rounded-xl mb-4" />
              <Skeleton className="h-3 w-1/2 mb-2 rounded" />
              <Skeleton className="h-7 w-3/4 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Description card */}
      <div className="rounded-2xl bg-white p-6 mb-4 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
        <div className="space-y-4">
          {Array.from({ length: descriptionRows }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-28 shrink-0 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Optional table */}
      {hasTable && (
        <div className="rounded-2xl bg-white p-6 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
          <Skeleton className="h-5 w-32 mb-4 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
