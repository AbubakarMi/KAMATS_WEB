'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { DataTable } from '@/components/tables/DataTable';
import { useGetDispatchQuery } from '@/lib/features/dispatch/dispatchApi';
import { formatWeight, formatNumber, formatDateTime } from '@/lib/utils/formatters';

interface ScannedItem {
  itemId: string;
  itemCode: string;
  scannedAt: string;
}

const scannedColumns: ColumnDef<ScannedItem, unknown>[] = [
  { accessorKey: 'itemCode', header: 'Item Code' },
  { accessorKey: 'scannedAt', header: 'Scanned At', cell: ({ getValue }) => formatDateTime(getValue() as string) },
];

export default function DispatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: dispatch, isLoading, isError, error, refetch } = useGetDispatchQuery(id);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !dispatch) return <DetailPageSkeleton descriptionRows={8} hasTable />;

  const scanProgress = dispatch.expectedCount > 0
    ? Math.round((dispatch.scannedCount / dispatch.expectedCount) * 100)
    : 0;

  const items = [
    { label: 'STO', value: <DocumentLink type="STO" id={dispatch.stoId} number={dispatch.stoNumber} /> },
    {
      label: 'Status',
      value: (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          dispatch.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
          dispatch.status === 'InTransit' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
        }`}>{dispatch.status}</span>
      ),
    },
    { label: 'Created', value: formatDateTime(dispatch.createdAt) },
    { label: 'Vehicle Reg', value: dispatch.vehicleReg },
    { label: 'Driver', value: dispatch.driverName },
    { label: 'Driver Phone', value: dispatch.driverPhone },
    { label: 'Expected Weight', value: dispatch.expectedWeightKg ? formatWeight(dispatch.expectedWeightKg) : '—' },
    { label: 'Dispatched Weight', value: dispatch.dispatchedWeightKg ? formatWeight(dispatch.dispatchedWeightKg) : '—' },
    { label: 'Weight Variance', value: dispatch.weightVariancePct ? `${dispatch.weightVariancePct}%` : '—' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
      </div>

      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-4">
        Dispatch — {dispatch.stoNumber}
      </h1>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={3} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Scan Progress</h3>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all ${scanProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(scanProgress, 100)}%` }}
          />
        </div>
        <p className="text-sm text-slate-600">
          {formatNumber(dispatch.scannedCount)} / {formatNumber(dispatch.expectedCount)} bags
          <span className="text-slate-400 ml-2">
            ({dispatch.expectedCount - dispatch.scannedCount} remaining)
          </span>
        </p>
      </div>

      {dispatch.scannedItems.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Scanned Items</h3>
          <DataTable<ScannedItem>
            columns={scannedColumns}
            data={dispatch.scannedItems}
            rowKey="itemId"
            showSearch={false}
            showExport={false}
          />
        </div>
      )}
    </div>
  );
}
