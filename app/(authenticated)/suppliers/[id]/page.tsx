'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Ban, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { KpiCard } from '@/components/charts/KpiCard';
import { ApprovalActions } from '@/components/forms/ApprovalActions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/tables/DataTable';
import { useCanPerformAction } from '@/lib/hooks';
import { Permissions as P } from '@/lib/utils/permissions';
import {
  useGetSupplierQuery,
  useGetSupplierScorecardQuery,
  useApproveSupplierMutation,
  useRejectSupplierMutation,
  useSuspendSupplierMutation,
  useReactivateSupplierMutation,
} from '@/lib/features/suppliers/suppliersApi';
import { formatDate, formatPercentage, formatDateTime } from '@/lib/utils/formatters';
import type { DeliveryScorecard } from '@/lib/api/types/suppliers';

const deliveryColumns: ColumnDef<DeliveryScorecard, unknown>[] = [
  { accessorKey: 'poNumber', header: 'PO Number' },
  {
    accessorKey: 'deliveryDate',
    header: 'Delivery Date',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'onTime',
    header: 'On Time',
    cell: ({ getValue }) => {
      const v = getValue() as boolean;
      return (
        <span className={v ? 'text-emerald-600' : 'text-red-600'}>
          {v ? 'Yes' : 'No'}
        </span>
      );
    },
  },
  {
    accessorKey: 'quantityVariancePct',
    header: 'Qty Variance',
    cell: ({ getValue }) => formatPercentage(getValue() as string),
  },
  {
    accessorKey: 'qualityPassed',
    header: 'Quality',
    cell: ({ getValue }) => {
      const v = getValue() as boolean;
      return (
        <span className={v ? 'text-emerald-600' : 'text-red-600'}>
          {v ? 'Pass' : 'Fail'}
        </span>
      );
    },
  },
];

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: supplier, isLoading, isError, error, refetch } = useGetSupplierQuery(id);
  const { data: scorecard } = useGetSupplierScorecardQuery({ id });

  const [approveSupplier] = useApproveSupplierMutation();
  const [rejectSupplier] = useRejectSupplierMutation();
  const [suspendSupplier] = useSuspendSupplierMutation();
  const [reactivateSupplier] = useReactivateSupplierMutation();

  const { canPerform: canApprove } = useCanPerformAction(P.SUPPLIERS_APPROVE, supplier?.createdBy);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const handleApprove = useCallback(async (notes?: string) => {
    try {
      await approveSupplier(id).unwrap();
      toast.success('Supplier approved');
    } catch { toast.error('Failed to approve supplier'); }
  }, [approveSupplier, id]);

  const handleReject = useCallback(async (reason: string) => {
    try {
      await rejectSupplier({ id, data: { rejectionReason: reason } }).unwrap();
      toast.success('Supplier rejected');
    } catch { toast.error('Failed to reject supplier'); }
  }, [rejectSupplier, id]);

  const handleSuspend = useCallback(async () => {
    if (!suspendReason.trim()) return;
    try {
      await suspendSupplier({ id, data: { reason: suspendReason.trim() } }).unwrap();
      toast.success('Supplier suspended');
      setSuspendOpen(false);
      setSuspendReason('');
    } catch { toast.error('Failed to suspend supplier'); }
  }, [suspendSupplier, id, suspendReason]);

  const handleReactivate = useCallback(async () => {
    try {
      await reactivateSupplier({ id }).unwrap();
      toast.success('Supplier reactivated');
      setReactivateOpen(false);
    } catch { toast.error('Failed to reactivate supplier'); }
  }, [reactivateSupplier, id]);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !supplier) return <DetailPageSkeleton hasKpiCards kpiCount={3} descriptionRows={10} hasTable />;

  const items = [
    { label: 'Registration #', value: supplier.registrationNumber },
    { label: 'Tax ID', value: supplier.taxId },
    { label: 'Address', value: supplier.address, span: 2 },
    { label: 'Contact Person', value: supplier.contactPerson },
    { label: 'Phone', value: supplier.contactPhone },
    { label: 'Email', value: supplier.contactEmail },
    { label: 'Bank', value: supplier.bankName },
    { label: 'Account #', value: supplier.bankAccountNumber },
    { label: 'Account Name', value: supplier.bankAccountName },
    { label: 'Created', value: formatDateTime(supplier.createdAt) },
    { label: 'Approved', value: supplier.approvedAt ? formatDateTime(supplier.approvedAt) : undefined },
    ...(supplier.rejectionReason
      ? [{ label: 'Rejection Reason', value: <span className="text-red-600">{supplier.rejectionReason}</span>, span: 2 }]
      : []),
    ...(supplier.suspensionReason
      ? [{ label: 'Suspension Reason', value: <span className="text-amber-600">{supplier.suspensionReason}</span>, span: 2 }]
      : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/suppliers')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            {supplier.name}
          </h1>
          <StatusBadge status={supplier.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {supplier.status === 'PendingApproval' && canApprove && (
            <ApprovalActions onApprove={handleApprove} onReject={handleReject} requireApprovalNotes />
          )}
          {supplier.status === 'Active' && canApprove && (
            <Button variant="destructive" size="sm" onClick={() => setSuspendOpen(true)}>
              <Ban className="h-4 w-4 mr-1" />Suspend
            </Button>
          )}
          {(supplier.status === 'Suspended' || supplier.status === 'Deactivated') && canApprove && (
            <Button size="sm" onClick={() => setReactivateOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-1" />Reactivate
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={2} />
      </div>

      {scorecard && (
        <>
          <h2 className="text-lg font-bold text-slate-900 mt-6 mb-3">Scorecard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <KpiCard title="On-Time Delivery Rate" value={formatPercentage(scorecard.overall.onTimeDeliveryRate)} />
            <KpiCard title="Quantity Accuracy Rate" value={formatPercentage(scorecard.overall.quantityAccuracyRate)} />
            <KpiCard title="Quality Acceptance Rate" value={formatPercentage(scorecard.overall.qualityAcceptanceRate)} />
          </div>
          <div className="rounded-[14px] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Delivery History ({scorecard.overall.totalDeliveries} total)
            </h3>
            <DataTable<DeliveryScorecard>
              columns={deliveryColumns}
              data={scorecard.deliveries}
              rowKey="deliveryId"
              showSearch={false}
              showExport={false}
            />
          </div>
        </>
      )}

      {/* Suspend Dialog */}
      <Dialog open={suspendOpen} onOpenChange={(open) => { if (!open) { setSuspendOpen(false); setSuspendReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Supplier</DialogTitle>
            <DialogDescription>
              Please provide a reason for suspending this supplier. This will be recorded in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={3}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="Enter suspension reason..."
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSuspendOpen(false); setSuspendReason(''); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={!suspendReason.trim()}>
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Dialog */}
      <ConfirmDialog
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
        title="Reactivate Supplier"
        description="Are you sure you want to reactivate this supplier? They will be restored to Active status."
        confirmLabel="Reactivate"
        onConfirm={handleReactivate}
      />
    </div>
  );
}
