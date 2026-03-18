'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Ban } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { ApprovalActions } from '@/components/forms/ApprovalActions';
import { DataTable } from '@/components/tables/DataTable';
import { useCanPerformAction } from '@/lib/hooks';
import { Permissions as P } from '@/lib/utils/permissions';
import {
  useGetSTOQuery,
  useSubmitSTOMutation,
  useAuthoriseSTOMutation,
  useRejectSTOMutation,
  useCancelSTOMutation,
} from '@/lib/features/transfers/stoApi';
import { formatNumber, formatDate, formatDateTime } from '@/lib/utils/formatters';
import type { STOItem } from '@/lib/api/types/distribution';

const itemColumns: ColumnDef<STOItem, unknown>[] = [
  { accessorKey: 'itemCode', header: 'Item Code' },
  { accessorKey: 'lotNumber', header: 'Lot' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
];

export default function STODetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: sto, isLoading, isError, error, refetch } = useGetSTOQuery(id);
  const [submitSTO] = useSubmitSTOMutation();
  const [authoriseSTO] = useAuthoriseSTOMutation();
  const [rejectSTO] = useRejectSTOMutation();
  const [cancelSTO] = useCancelSTOMutation();

  const { canPerform: canSubmit } = useCanPerformAction(P.STO_CREATE, null, false);
  const { canPerform: canAuthorise } = useCanPerformAction(
    [P.STO_APPROVE_CENTRAL_UNIT, P.STO_APPROVE_UNIT_USER],
    sto?.requestedBy,
  );

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !sto) return <DetailPageSkeleton descriptionRows={10} hasTable />;

  const handleSubmit = async () => {
    try { await submitSTO(id).unwrap(); toast.success('STO submitted for authorisation'); }
    catch { toast.error('Failed to submit STO'); }
  };

  const handleAuthorise = async () => {
    try { await authoriseSTO({ id }).unwrap(); toast.success('STO authorised'); }
    catch { toast.error('Failed to authorise STO'); }
  };

  const handleReject = async (reason: string) => {
    try { await rejectSTO({ id, body: { rejectionReason: reason } }).unwrap(); toast.success('STO rejected'); }
    catch { toast.error('Failed to reject STO'); }
  };

  const handleCancel = async () => {
    try { await cancelSTO({ id, body: { reason: 'Cancelled by user' } }).unwrap(); toast.success('STO cancelled'); }
    catch { toast.error('Failed to cancel STO'); }
  };

  const items = [
    { label: 'STO Number', value: sto.stoNumber },
    { label: 'Trigger', value: sto.triggerType.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'Status', value: <StatusBadge status={sto.status} /> },
    { label: 'Source Store', value: sto.sourceStoreName },
    { label: 'Destination Store', value: sto.destinationStoreName },
    { label: 'Requested Delivery', value: formatDate(sto.requestedDelivery) },
    { label: 'Requested Bags', value: formatNumber(sto.requestedBags) },
    { label: 'Authorised Bags', value: sto.authorisedBags != null ? formatNumber(sto.authorisedBags) : '—' },
    { label: 'Source Balance at Auth', value: sto.sourceBalanceAtAuth != null ? formatNumber(sto.sourceBalanceAtAuth) : '—' },
    { label: 'Requested By', value: sto.requestedByName },
    { label: 'Requested At', value: formatDateTime(sto.requestedAt) },
    { label: 'Created', value: formatDateTime(sto.createdAt) },
    ...(sto.authorisedByName ? [
      { label: 'Authorised By', value: sto.authorisedByName },
      { label: 'Authorised At', value: sto.authorisedAt ? formatDateTime(sto.authorisedAt) : '—' },
    ] : []),
    ...(sto.rejectionReason ? [
      { label: 'Rejection Reason', value: <span className="text-red-600">{sto.rejectionReason}</span>, span: 3 },
    ] : []),
    { label: 'Justification', value: sto.justification, span: 3 },
    ...(sto.notes ? [{ label: 'Notes', value: sto.notes, span: 3 }] : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/transfers')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          {sto.stoNumber}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {sto.status === 'Draft' && canSubmit && (
            <>
              <Button size="sm" onClick={handleSubmit}><Send className="h-4 w-4 mr-1" />Submit</Button>
              <Button size="sm" variant="destructive" onClick={handleCancel}><Ban className="h-4 w-4 mr-1" />Cancel</Button>
            </>
          )}
          {sto.status === 'Submitted' && canAuthorise && (
            <ApprovalActions onApprove={handleAuthorise} onReject={handleReject} approveLabel="Authorise" />
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={3} />
      </div>

      {sto.tdnNumber && sto.tdnId && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-4 mb-4 flex items-center gap-6">
          <span className="text-sm font-semibold text-slate-700">TDN:</span>
          <DocumentLink type="TDN" id={sto.tdnId} number={sto.tdnNumber} />
          {sto.grdNumber && sto.grdId && (
            <>
              <span className="text-sm font-semibold text-slate-700 ml-4">GRD:</span>
              <DocumentLink type="GRD" id={sto.grdId} number={sto.grdNumber} />
            </>
          )}
        </div>
      )}

      {sto.preSelectedItems.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Pre-Selected Items</h3>
          <DataTable<STOItem>
            columns={itemColumns}
            data={sto.preSelectedItems}
            rowKey="itemId"
            showSearch={false}
            showExport={false}
          />
        </div>
      )}
    </div>
  );
}
