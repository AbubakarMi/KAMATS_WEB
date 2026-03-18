'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { DataTable } from '@/components/tables/DataTable';
import { useGetReceiptQuery, useGetShortageReportQuery } from '@/lib/features/receipt/receiptApi';
import { formatNumber, formatDateTime } from '@/lib/utils/formatters';

interface ReceivedItem { itemId: string; itemCode: string; condition: string; scannedAt: string; damageNotes: string | null; }
interface MissingItem { itemId: string; itemCode: string; }

const receivedColumns: ColumnDef<ReceivedItem, unknown>[] = [
  { accessorKey: 'itemCode', header: 'Item Code' },
  {
    accessorKey: 'condition',
    header: 'Condition',
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          v === 'Good' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>{v}</span>
      );
    },
  },
  { accessorKey: 'scannedAt', header: 'Scanned At', cell: ({ getValue }) => formatDateTime(getValue() as string) },
  { accessorKey: 'damageNotes', header: 'Damage Notes', cell: ({ getValue }) => (getValue() as string | null) ?? '—' },
];

const missingColumns: ColumnDef<MissingItem, unknown>[] = [
  { accessorKey: 'itemCode', header: 'Item Code' },
  { accessorKey: 'itemId', header: 'Item ID' },
];

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: receipt, isLoading, isError, error, refetch } = useGetReceiptQuery(id);
  const { data: shortageReport } = useGetShortageReportQuery(id, {
    skip: !receipt || receipt.missingItems.length === 0,
  });

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !receipt) return <DetailPageSkeleton descriptionRows={8} hasTable />;

  const scanProgress = receipt.expectedBags > 0
    ? Math.round((receipt.scannedCount / receipt.expectedBags) * 100)
    : 0;

  const items = [
    { label: 'GRD Number', value: receipt.grdNumber },
    { label: 'TDN', value: <DocumentLink type="TDN" id={receipt.tdnId} number={receipt.tdnNumber} /> },
    { label: 'STO', value: <DocumentLink type="STO" id={receipt.stoId} number={receipt.stoNumber} /> },
    { label: 'Source Store', value: receipt.sourceStoreName },
    { label: 'Expected Bags', value: formatNumber(receipt.expectedBags) },
    { label: 'Scanned', value: formatNumber(receipt.scannedCount) },
    { label: 'Arrival', value: formatDateTime(receipt.arrivalAt) },
    { label: 'Created', value: formatDateTime(receipt.createdAt) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
      </div>

      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-4">
        Receipt — {receipt.grdNumber}
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
          {formatNumber(receipt.scannedCount)} / {formatNumber(receipt.expectedBags)} bags
        </p>
      </div>

      {receipt.missingItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-4 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Missing Items Detected</p>
            <p className="text-sm text-amber-700">{receipt.missingItems.length} items were not scanned during receipt.</p>
          </div>
        </div>
      )}

      {receipt.receivedItems.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Received Items</h3>
          <DataTable<ReceivedItem>
            columns={receivedColumns}
            data={receipt.receivedItems}
            rowKey="itemId"
            showSearch={false}
            showExport={false}
          />
        </div>
      )}

      {receipt.missingItems.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Missing Items</h3>
          <DataTable<MissingItem>
            columns={missingColumns}
            data={receipt.missingItems}
            rowKey="itemId"
            showSearch={false}
            showExport={false}
          />
        </div>
      )}

      {shortageReport && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Shortage Report</h3>
          <DescriptionList items={[
            { label: 'Dispatched', value: `${formatNumber(shortageReport.dispatchedBags)} bags` },
            { label: 'Received', value: `${formatNumber(shortageReport.receivedBags)} bags` },
            { label: 'Shortage', value: `${formatNumber(shortageReport.shortageBags)} bags` },
            {
              label: 'Investigation Status',
              value: (
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  shortageReport.investigationStatus === 'Open' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>{shortageReport.investigationStatus}</span>
              ),
            },
            { label: 'Source', value: shortageReport.sourceStoreName },
            { label: 'Destination', value: shortageReport.destinationStoreName },
          ]} columns={2} />
        </div>
      )}
    </div>
  );
}
