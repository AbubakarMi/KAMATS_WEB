'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { useGetStoresQuery } from '@/lib/features/admin/adminApi';
import { formatDateTime } from '@/lib/utils/formatters';

export default function StoreDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: stores, isLoading } = useGetStoresQuery();

  const store = stores?.find((s) => s.id === id);

  if (isLoading) return <DetailPageSkeleton descriptionRows={6} />;

  if (!store) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/stores')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            Store Not Found
          </h1>
        </div>
        <p className="text-sm text-slate-500">The store could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/stores')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            {store.name}
          </h1>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/stores/edit/${store.id}`}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />Edit
          </Link>
        </Button>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <DescriptionList items={[
          { label: 'Code', value: store.code },
          { label: 'Tier', value: <StatusBadge status={store.tier} /> },
          { label: 'Parent Store', value: store.parentStoreName || '—' },
          { label: 'Address', value: store.address || '—' },
          {
            label: 'GPS Coordinates',
            value: store.gpsLatitude && store.gpsLongitude
              ? `${store.gpsLatitude}, ${store.gpsLongitude}`
              : '—',
          },
          {
            label: 'Status',
            value: store.isActive
              ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Active</span>
              : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Inactive</span>,
          },
          { label: 'Created', value: formatDateTime(store.createdAt) },
        ]} />
      </div>
    </div>
  );
}
