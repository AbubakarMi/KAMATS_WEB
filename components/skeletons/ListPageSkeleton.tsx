'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface ListPageSkeletonProps {
  rows?: number;
}

export function ListPageSkeleton({ rows = 5 }: ListPageSkeletonProps) {
  return (
    <div>
      {/* Title + button bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white p-6 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
