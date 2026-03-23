'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { ApprovalActions } from '@/components/forms/ApprovalActions';
import { useCanPerformAction } from '@/lib/hooks';
import { Permissions as P } from '@/lib/utils/permissions';
import {
  useGetPRQuery,
  useSubmitPRMutation,
  useApprovePRMutation,
  useRejectPRMutation,
} from '@/lib/features/procurement/prApi';
import { formatDate, formatDateTime, formatWeight, formatNumber } from '@/lib/utils/formatters';

export default function PRDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: pr, isLoading, isError, error, refetch } = useGetPRQuery(id);
  const [submitPR] = useSubmitPRMutation();
  const [approvePR] = useApprovePRMutation();
  const [rejectPR] = useRejectPRMutation();

  const { canPerform: canSubmit } = useCanPerformAction(P.PR_CREATE, null, false);
  const { canPerform: canApprove } = useCanPerformAction(P.PR_APPROVE, pr?.raisedBy);
  const { canPerform: canConvertToPO } = useCanPerformAction(P.PO_CREATE, null, false);

  const handleSubmit = useCallback(async () => {
    try {
      await submitPR(id).unwrap();
      toast.success('PR submitted for approval');
    } catch { toast.error('Failed to submit PR'); }
  }, [submitPR, id]);

  const handleApprove = useCallback(async (notes?: string) => {
    try {
      await approvePR({ id, data: { notes } }).unwrap();
      toast.success('PR approved');
    } catch { toast.error('Failed to approve PR'); }
  }, [approvePR, id]);

  const handleReject = useCallback(async (reason: string) => {
    try {
      await rejectPR({ id, data: { rejectionReason: reason } }).unwrap();
      toast.success('PR rejected');
    } catch { toast.error('Failed to reject PR'); }
  }, [rejectPR, id]);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !pr) return <DetailPageSkeleton descriptionRows={10} />;

  const items = [
    { label: 'PR Number', value: pr.prNumber },
    { label: 'Status', value: <StatusBadge status={pr.status} /> },
    { label: 'Trigger Type', value: pr.triggerType === 'AutoReorderPoint' ? 'Auto (Reorder Point)' : 'Manual' },
    { label: 'Store', value: pr.storeName },
    { label: 'Requested Quantity', value: `${formatNumber(pr.requestedQuantity)} bags` },
    { label: 'Requested Weight', value: formatWeight(pr.requestedWeightKg) },
    { label: 'Stock Balance at PR', value: `${formatNumber(pr.stockBalanceAtPr)} bags` },
    { label: 'Delivery Date', value: formatDate(pr.requestedDeliveryDate) },
    { label: 'Justification', value: pr.justification, span: 2 },
    { label: 'Raised By', value: pr.raisedByName },
    { label: 'Raised At', value: formatDateTime(pr.raisedAt) },
    ...(pr.approvedByName ? [
      { label: 'Approved By', value: pr.approvedByName },
      { label: 'Approved At', value: formatDateTime(pr.approvedAt) },
    ] : []),
    ...(pr.rejectionReason ? [
      { label: 'Rejection Reason', value: <span className="text-red-600">{pr.rejectionReason}</span>, span: 2 },
    ] : []),
    ...(pr.expiresAt ? [{ label: 'Expires At', value: formatDateTime(pr.expiresAt) }] : []),
    ...(pr.linkedPoId ? [
      { label: 'Linked PO', value: <DocumentLink type="PO" id={pr.linkedPoId} number={pr.linkedPoNumber!} /> },
    ] : []),
    { label: 'Created', value: formatDateTime(pr.createdAt) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/purchase-requisitions')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            {pr.prNumber}
          </h1>
          <StatusBadge status={pr.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pr.status === 'Draft' && canSubmit && (
            <Button size="sm" onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-1" />Submit
            </Button>
          )}
          {pr.status === 'Submitted' && canApprove && (
            <ApprovalActions onApprove={handleApprove} onReject={handleReject} />
          )}
          {pr.status === 'Approved' && !pr.linkedPoId && canConvertToPO && (
            <Button size="sm" onClick={() => router.push(`/purchase-orders/create?prId=${pr.id}`)}>
              <ArrowLeftRight className="h-4 w-4 mr-1" />Convert to PO
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <DescriptionList items={items} columns={2} />
      </div>
    </div>
  );
}
