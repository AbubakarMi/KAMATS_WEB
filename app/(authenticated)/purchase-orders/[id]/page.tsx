'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
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
import { DownloadPdfButton } from '@/components/DownloadPdfButton';
import { generatePOPdf } from '@/lib/utils/pdfGenerators';
import { useCanPerformAction } from '@/lib/hooks';
import { Permissions as P } from '@/lib/utils/permissions';
import {
  useGetPOQuery,
  useSubmitPOMutation,
  useApproveManagerPOMutation,
  useRejectManagerPOMutation,
  useApproveFinancePOMutation,
  useRejectFinancePOMutation,
} from '@/lib/features/procurement/poApi';
import { formatDate, formatDateTime, formatMoney, formatWeight } from '@/lib/utils/formatters';
import type { POLine, POAmendment } from '@/lib/api/types/procurement';

export default function PODetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: po, isLoading, isError, error, refetch } = useGetPOQuery(id);
  const [submitPO] = useSubmitPOMutation();
  const [approveManager] = useApproveManagerPOMutation();
  const [rejectManager] = useRejectManagerPOMutation();
  const [approveFinance] = useApproveFinancePOMutation();
  const [rejectFinance] = useRejectFinancePOMutation();

  const { canPerform: canSubmit } = useCanPerformAction(P.PO_CREATE, null, false);
  const { canPerform: canManagerApprove } = useCanPerformAction(P.PO_APPROVE_MANAGER, po?.requestedBy);
  const { canPerform: canFinanceApprove } = useCanPerformAction(P.PO_APPROVE_FINANCE, po?.requestedBy);

  const handleSubmit = useCallback(async () => {
    try {
      await submitPO(id).unwrap();
      toast.success('PO submitted for approval');
    } catch { toast.error('Failed to submit PO'); }
  }, [submitPO, id]);

  const handleManagerApprove = useCallback(async (notes?: string) => {
    try {
      await approveManager({ id, data: { notes } }).unwrap();
      toast.success('PO approved by manager');
    } catch { toast.error('Failed to approve PO'); }
  }, [approveManager, id]);

  const handleManagerReject = useCallback(async (reason: string) => {
    try {
      await rejectManager({ id, data: { rejectionReason: reason } }).unwrap();
      toast.success('PO rejected by manager');
    } catch { toast.error('Failed to reject PO'); }
  }, [rejectManager, id]);

  const handleFinanceApprove = useCallback(async (notes?: string) => {
    try {
      await approveFinance({ id, data: { notes } }).unwrap();
      toast.success('PO approved by finance — issued');
    } catch { toast.error('Failed to approve PO'); }
  }, [approveFinance, id]);

  const handleFinanceReject = useCallback(async (reason: string) => {
    try {
      await rejectFinance({ id, data: { rejectionReason: reason } }).unwrap();
      toast.success('PO rejected by finance');
    } catch { toast.error('Failed to reject PO'); }
  }, [rejectFinance, id]);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !po) return <DetailPageSkeleton descriptionRows={12} hasTable />;

  const lineColumns: ColumnDef<POLine, unknown>[] = [
    { accessorKey: 'lineNumber', header: '#', size: 50 },
    { accessorKey: 'productSpecification', header: 'Product Specification' },
    { accessorKey: 'quantityBags', header: 'Qty (bags)', size: 100 },
    { accessorKey: 'standardWeightKg', header: 'Std Weight', size: 100, cell: ({ getValue }) => formatWeight(getValue() as string) },
    { accessorKey: 'unitPrice', header: 'Unit Price', size: 120, cell: ({ getValue }) => formatMoney(getValue() as string, po.currency) },
    { accessorKey: 'lineTotal', header: 'Line Total', size: 140, cell: ({ getValue }) => formatMoney(getValue() as string, po.currency) },
  ];

  const amendmentColumns: ColumnDef<POAmendment, unknown>[] = [
    { accessorKey: 'amendmentVersion', header: 'Version', size: 80 },
    { accessorKey: 'justification', header: 'Justification' },
    { accessorKey: 'status', header: 'Status', size: 180, cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
    { accessorKey: 'requestedAt', header: 'Requested', size: 150, cell: ({ getValue }) => formatDateTime(getValue() as string) },
  ];

  const items = [
    { label: 'PO Number', value: po.poNumber },
    { label: 'Status', value: <StatusBadge status={po.status} /> },
    { label: 'Linked PR', value: <DocumentLink type="PR" id={po.prId} number={po.prNumber} /> },
    { label: 'Supplier', value: po.supplierName },
    { label: 'Destination Store', value: po.destinationStoreName },
    { label: 'Currency', value: po.currency },
    { label: 'Total Amount', value: formatMoney(po.totalAmount, po.currency) },
    { label: 'Expected Delivery', value: formatDate(po.expectedDeliveryDate) },
    { label: 'Requested By', value: po.requestedByName },
    { label: 'Requested At', value: formatDateTime(po.requestedAt) },
    ...(po.managerApprovedByName ? [
      { label: 'Manager Approved By', value: po.managerApprovedByName },
      { label: 'Manager Approved At', value: formatDateTime(po.managerApprovedAt) },
    ] : []),
    ...(po.managerRejectionReason ? [
      { label: 'Manager Rejection', value: <span className="text-red-600">{po.managerRejectionReason}</span>, span: 2 },
    ] : []),
    ...(po.financeApprovedByName ? [
      { label: 'Finance Approved By', value: po.financeApprovedByName },
      { label: 'Finance Approved At', value: formatDateTime(po.financeApprovedAt) },
    ] : []),
    ...(po.financeRejectionReason ? [
      { label: 'Finance Rejection', value: <span className="text-red-600">{po.financeRejectionReason}</span>, span: 2 },
    ] : []),
    ...(po.issuedAt ? [{ label: 'Issued At', value: formatDateTime(po.issuedAt) }] : []),
    { label: 'Created', value: formatDateTime(po.createdAt) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/purchase-orders')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            {po.poNumber}
          </h1>
          <StatusBadge status={po.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DownloadPdfButton onGenerate={() => generatePOPdf(po)} />
          {po.status === 'Draft' && canSubmit && (
            <Button size="sm" onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-1" />Submit
            </Button>
          )}
          {po.status === 'Submitted' && canManagerApprove && (
            <ApprovalActions
              onApprove={handleManagerApprove}
              onReject={handleManagerReject}
              approveLabel="Manager Approve"
              rejectLabel="Manager Reject"
            />
          )}
          {po.status === 'ManagerApproved' && canFinanceApprove && (
            <ApprovalActions
              onApprove={handleFinanceApprove}
              onReject={handleFinanceReject}
              approveLabel="Finance Approve"
              rejectLabel="Finance Reject"
            />
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={2} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">PO Lines</h3>
        <DataTable<POLine>
          columns={lineColumns}
          data={po.lines}
          rowKey="lineNumber"
          showSearch={false}
          showExport={false}
        />
      </div>

      {po.amendments.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Amendments ({po.amendments.length})
          </h3>
          <DataTable<POAmendment>
            columns={amendmentColumns}
            data={po.amendments}
            rowKey="id"
            showSearch={false}
            showExport={false}
          />
        </div>
      )}
    </div>
  );
}
