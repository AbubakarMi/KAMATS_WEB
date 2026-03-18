'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { ApprovalActions } from '@/components/forms/ApprovalActions';
import { DataTable } from '@/components/tables/DataTable';
import { useCanPerformAction } from '@/lib/hooks';
import { Permissions as P } from '@/lib/utils/permissions';
import {
  useGetStockCountQuery,
  useApproveVarianceMutation,
  useRejectVarianceMutation,
  useOrderRecountMutation,
} from '@/lib/features/stockCount/stockCountApi';
import { formatNumber, formatDate, formatDateTime } from '@/lib/utils/formatters';
import type { CountLine } from '@/lib/api/types/stockCount';

const lineColumns: ColumnDef<CountLine, unknown>[] = [
  { accessorKey: 'locationCode', header: 'Location', size: 100 },
  { accessorKey: 'lotNumber', header: 'Lot', size: 140 },
  {
    accessorKey: 'systemQty',
    header: 'System Qty',
    size: 90,
    cell: ({ getValue }) => formatNumber(getValue() as number),
  },
  {
    accessorKey: 'countedQty',
    header: 'Counted',
    size: 90,
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      return v != null ? formatNumber(v) : '—';
    },
  },
  {
    accessorKey: 'variance',
    header: 'Variance',
    size: 80,
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      if (v == null) return '—';
      const color = v < 0 ? 'text-red-600' : v > 0 ? 'text-emerald-600' : '';
      return <span className={color}>{v > 0 ? '+' : ''}{formatNumber(v)}</span>;
    },
  },
  {
    accessorKey: 'variancePct',
    header: 'Variance %',
    size: 90,
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      if (v == null) return '—';
      const color = Math.abs(v) >= 5 ? 'text-red-600' : Math.abs(v) >= 2 ? 'text-amber-600' : '';
      return <span className={color}>{v.toFixed(1)}%</span>;
    },
  },
];

export default function StockCountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: count, isLoading, isError, error, refetch } = useGetStockCountQuery(id);
  const [approveVariance] = useApproveVarianceMutation();
  const [rejectVariance] = useRejectVarianceMutation();
  const [orderRecount] = useOrderRecountMutation();

  const { canPerform: canApproveVariance } = useCanPerformAction(P.STOCKCOUNT_APPROVE, count?.assignedTo);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !count) return <DetailPageSkeleton descriptionRows={8} hasTable />;

  const handleApprove = async (notes?: string) => {
    try {
      await approveVariance({ id, body: { approvalNotes: notes ?? '' } }).unwrap();
      toast.success('Variance approved — ledger adjusted');
    } catch { toast.error('Failed to approve variance'); }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectVariance({ id, body: { rejectionReason: reason } }).unwrap();
      toast.success('Variance rejected — recount ordered');
    } catch { toast.error('Failed to reject variance'); }
  };

  const handleRecount = async () => {
    try {
      await orderRecount({ id, body: { recountAssignedTo: count.assignedTo } }).unwrap();
      toast.success('Recount ordered');
    } catch { toast.error('Failed to order recount'); }
  };

  const items = [
    { label: 'Count Type', value: count.countType.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'Store', value: count.storeName },
    { label: 'Status', value: <StatusBadge status={count.status} /> },
    { label: 'Frozen Balance', value: `${formatNumber(count.frozenBalance)} bags` },
    {
      label: 'Total Variance',
      value: count.totalVarianceBags != null ? (
        <span className={count.totalVarianceBags < 0 ? 'text-red-600' : ''}>
          {count.totalVarianceBags > 0 ? '+' : ''}{formatNumber(count.totalVarianceBags)} bags
        </span>
      ) : '—',
    },
    {
      label: 'Severity',
      value: count.varianceSeverity ? <StatusBadge status={count.varianceSeverity} /> : '—',
    },
    { label: 'Assigned To', value: count.assignedToName },
    { label: 'Scheduled', value: formatDate(count.scheduledDate) },
    { label: 'Created', value: formatDateTime(count.createdAt) },
    ...(count.recountAssignedToName ? [{ label: 'Recount Assigned To', value: count.recountAssignedToName }] : []),
    ...(count.approvedAt ? [
      { label: 'Approved At', value: formatDateTime(count.approvedAt) },
      { label: 'Approval Notes', value: count.approvalNotes },
    ] : []),
    ...(count.rejectionReason ? [{ label: 'Rejection Reason', value: count.rejectionReason }] : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/stock-counts')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          {count.countNumber}
        </h1>
        {count.status === 'PendingApproval' && canApproveVariance && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRecount}>
              <RotateCcw className="h-4 w-4 mr-1" />Order Recount
            </Button>
            <ApprovalActions
              onApprove={handleApprove}
              onReject={handleReject}
              approveLabel="Approve Variance"
              rejectLabel="Reject"
              requireApprovalNotes
            />
          </div>
        )}
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={3} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Count Lines</h3>
        <DataTable<CountLine>
          columns={lineColumns}
          data={count.lines}
          rowKey={(r) => `${r.lotId}-${r.locationId}`}
          showSearch={false}
          showExport={false}
        />
      </div>
    </div>
  );
}
