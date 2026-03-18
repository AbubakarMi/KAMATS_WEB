'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { useGetDVRQuery } from '@/lib/features/quality/qualityApi';
import { formatDateTime } from '@/lib/utils/formatters';

export default function DVRDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: dvr, isLoading, isError, error, refetch } = useGetDVRQuery(id);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !dvr) return <DetailPageSkeleton descriptionRows={8} />;

  const items = [
    { label: 'DVR Number', value: dvr.dvrNumber },
    { label: 'Status', value: <StatusBadge status={dvr.status} /> },
    { label: 'Driver Name', value: dvr.driverName },
    { label: 'Driver ID', value: dvr.driverIdNumber },
    { label: 'Phone', value: dvr.driverPhone },
    { label: 'Vehicle Reg', value: dvr.vehicleReg },
    { label: 'Supplier', value: dvr.supplierName },
    {
      label: 'PO',
      value: dvr.poId
        ? <DocumentLink type="PO" id={dvr.poId} number={dvr.poNumber!} />
        : <span className="text-slate-400">Not linked</span>,
    },
    { label: 'Gate Officer', value: dvr.gateOfficerName },
    { label: 'Created', value: formatDateTime(dvr.createdAt) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/quality/dvr')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          {dvr.dvrNumber}
        </h1>
        <StatusBadge status={dvr.status} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <DescriptionList items={items} columns={2} />
      </div>

      {dvr.status === 'PendingPOMatch' && (
        <div className="rounded-[14px] border border-amber-200 bg-amber-50 p-4 mt-4">
          <p className="text-sm text-amber-700">
            This DVR is pending PO linkage. Link a PO to proceed with quality inspection.
          </p>
        </div>
      )}
    </div>
  );
}
