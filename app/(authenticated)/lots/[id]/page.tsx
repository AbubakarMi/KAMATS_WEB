'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { KpiCard } from '@/components/charts/KpiCard';
import { DataTable } from '@/components/tables/DataTable';
import { useGetLotQuery, useGenerateLabelsMutation } from '@/lib/features/inventory/lotsApi';
import { formatNumber, formatWeight, formatDate, formatDateTime } from '@/lib/utils/formatters';
import type { Item } from '@/lib/api/types/inventory';

const itemColumns: ColumnDef<Item, unknown>[] = [
  {
    accessorKey: 'itemCode',
    header: 'Item Code',
    cell: ({ row }) => (
      <Link href={`/items/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.itemCode}
      </Link>
    ),
  },
  { accessorKey: 'qrCode', header: 'QR Code', size: 180 },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: 'locationCode',
    header: 'Location',
    size: 100,
    cell: ({ getValue }) => (getValue() as string | null) || '—',
  },
  {
    accessorKey: 'standardWeightKg',
    header: 'Std Weight',
    size: 100,
    cell: ({ getValue }) => formatWeight(getValue() as string),
  },
  {
    accessorKey: 'remainingWeightKg',
    header: 'Remaining',
    size: 100,
    cell: ({ getValue }) => formatWeight(getValue() as string),
  },
];

export default function LotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: lot, isLoading, isError, error, refetch } = useGetLotQuery(id);
  const [generateLabels, { isLoading: generating }] = useGenerateLabelsMutation();

  const handleGenerateLabels = async () => {
    try {
      const result = await generateLabels({ lotId: id }).unwrap();
      toast.success(`Generated ${result.totalLabels} labels`);
    } catch {
      toast.error('Failed to generate labels');
    }
  };

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !lot) return <DetailPageSkeleton descriptionRows={6} hasTable />;

  const items = [
    { label: 'Lot Number', value: lot.lotNumber },
    { label: 'Status', value: <StatusBadge status={lot.status} /> },
    { label: 'GRN', value: lot.grnNumber },
    { label: 'PO', value: lot.poNumber },
    { label: 'Supplier', value: lot.supplierName },
    { label: 'Store', value: lot.storeName },
    { label: 'Receipt Date', value: formatDate(lot.receiptDate) },
    { label: 'Standard Weight', value: formatWeight(lot.standardWeightKg) },
    { label: 'FIFO Sequence', value: lot.fifoSequence },
    { label: 'Bags Reserved', value: formatNumber(lot.bagsReserved) },
    { label: 'Bags In Transit', value: formatNumber(lot.bagsInTransit) },
    { label: 'Created', value: formatDateTime(lot.createdAt) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/lots')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            {lot.lotNumber}
          </h1>
          <StatusBadge status={lot.status} />
        </div>
        {lot.status === 'PendingLabelling' && (
          <Button size="sm" onClick={handleGenerateLabels} disabled={generating}>
            <Printer className="h-4 w-4 mr-1" />
            {generating ? 'Generating...' : 'Generate Labels'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <KpiCard title="Total Bags" value={lot.totalBags} />
        <KpiCard title="In Stock" value={lot.bagsInStock} />
        <KpiCard title="Consumed" value={lot.bagsConsumed} />
        <KpiCard title="Written Off" value={lot.bagsWrittenOff} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={2} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Items ({lot.items?.length ?? 0})
        </h3>
        <DataTable<Item>
          columns={itemColumns}
          data={lot.items ?? []}
          rowKey="id"
          showSearch={false}
          showExport={false}
        />
      </div>
    </div>
  );
}
