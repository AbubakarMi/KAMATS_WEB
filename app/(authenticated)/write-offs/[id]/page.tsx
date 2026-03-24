'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { ApprovalActions } from '@/components/forms/ApprovalActions';
import { DownloadPdfButton } from '@/components/DownloadPdfButton';
import { generateWriteOffPdf } from '@/lib/utils/pdfGenerators';
import { useCanPerformAction } from '@/lib/hooks';
import { Permissions as P } from '@/lib/utils/permissions';
import {
  useGetWriteOffQuery,
  useApproveWriteOffMutation,
  useRejectWriteOffMutation,
} from '@/lib/features/loss/lossApi';
import { formatWeight, formatNumber, formatDateTime } from '@/lib/utils/formatters';

export default function WriteOffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: wo, isLoading, isError, error, refetch } = useGetWriteOffQuery(id);
  const [approveWriteOff] = useApproveWriteOffMutation();
  const [rejectWriteOff] = useRejectWriteOffMutation();

  const approvalPermission = wo?.approvalRoute === 'Critical'
    ? P.WRITEOFF_APPROVE_CRITICAL
    : wo?.approvalRoute === 'Significant'
      ? P.WRITEOFF_APPROVE_SIGNIFICANT
      : P.WRITEOFF_APPROVE_MINOR;
  const { canPerform: canApprove } = useCanPerformAction(approvalPermission, wo?.raisedBy);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !wo) return <DetailPageSkeleton descriptionRows={8} />;

  const handleApprove = async (notes?: string) => {
    try {
      await approveWriteOff({ id, body: { approvalNotes: notes ?? '' } }).unwrap();
      toast.success('Write-off approved — ledger adjusted');
    } catch {
      toast.error('Failed to approve write-off');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectWriteOff({ id, body: { rejectionReason: reason } }).unwrap();
      toast.success('Write-off rejected');
    } catch {
      toast.error('Failed to reject write-off');
    }
  };

  const items = [
    { label: 'Request Number', value: wo.requestNumber },
    { label: 'Status', value: <StatusBadge status={wo.status} /> },
    { label: 'Category', value: <StatusBadge status={wo.category} /> },
    { label: 'Store', value: wo.storeName },
    { label: 'Bags', value: formatNumber(wo.bagsCount) },
    { label: 'Weight', value: formatWeight(wo.weightKg) },
    { label: 'Approval Route', value: wo.approvalRoute },
    { label: 'Raised By', value: wo.raisedByName },
    { label: 'Raised At', value: formatDateTime(wo.raisedAt) },
    { label: 'Description', value: wo.description, span: 3 as const },
    ...(wo.approvedByName ? [
      { label: 'Approved By', value: wo.approvedByName },
      { label: 'Approved At', value: wo.approvedAt ? formatDateTime(wo.approvedAt) : '—' },
      { label: 'Approval Notes', value: wo.approvalNotes ?? '—' },
    ] : []),
    ...(wo.rejectionReason ? [
      { label: 'Rejection Reason', value: <span className="text-red-600">{wo.rejectionReason}</span>, span: 3 as const },
    ] : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/write-offs')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          {wo.requestNumber}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <DownloadPdfButton onGenerate={() => generateWriteOffPdf(wo)} />
          {wo.status === 'Pending' && canApprove && (
            <ApprovalActions onApprove={handleApprove} onReject={handleReject} requireApprovalNotes />
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={3} />
      </div>

      {wo.photoUrls.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Photos</h3>
          <div className="flex flex-wrap gap-3">
            {wo.photoUrls.map((url, i) => (
              <img key={i} src={url} alt={`Write-off photo ${i + 1}`} className="w-[120px] h-[120px] object-cover rounded-lg border border-slate-200" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
