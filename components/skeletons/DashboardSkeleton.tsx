'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div>
      {/* Welcome skeleton */}
      <div className="mb-6">
        <Skeleton className="h-7 w-64 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-lg" />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-5 border border-stone-100/80 shadow-[var(--k-shadow-card)]"
          >
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-10 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-1/2 mb-2 rounded" />
            <Skeleton className="h-7 w-3/4 rounded" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white p-6 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
            <Skeleton className="h-5 w-40 mb-5 rounded-lg" />
            <Skeleton className="h-[240px] w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.65fr] gap-4">
        <div className="rounded-2xl bg-white p-6 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
          <Skeleton className="h-5 w-36 mb-4 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
          <Skeleton className="h-5 w-32 mb-4 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
