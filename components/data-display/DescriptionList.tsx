'use client';

import { cn } from '@/lib/utils';

interface DescriptionItem {
  label: string;
  value: React.ReactNode;
  span?: number;
}

interface DescriptionListProps {
  items: DescriptionItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const gridColsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const spanMap: Record<number, string> = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'sm:col-span-2 lg:col-span-4',
};

export function DescriptionList({ items, columns = 2, className }: DescriptionListProps) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-4', gridColsMap[columns], className)}>
      {items.map((item, i) => (
        <div key={i} className={cn(item.span ? spanMap[item.span] : '')}>
          <dt className="k-label mb-1">{item.label}</dt>
          <dd className="text-sm text-stone-700">{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
