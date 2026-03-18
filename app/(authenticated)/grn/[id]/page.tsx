'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { useGetGRNQuery } from '@/lib/features/grn/grnApi';
import { formatNumber, formatWeight, formatDateTime } from '@/lib/utils/formatters';

export default function GRNDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: grn, isLoading, isError, error, refetch } = useGetGRNQuery(id);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !grn) return <DetailPageSkeleton descriptionRows={10} hasTable />;

  const items = [
    { label: 'GRN #', value: grn.grnNumber },
    { label: 'Status', value: <StatusBadge status={grn.status} /> },
    { label: 'PO', value: <DocumentLink type="PO" id={grn.poId} number={grn.poNumber} /> },
    { label: 'Weighbridge Ticket', value: <DocumentLink type="WT" id={grn.weighbridgeTicketId} number={grn.ticketNumber} /> },
    { label: 'Store', value: grn.storeName },
    { label: 'Net Weight', value: formatWeight(grn.netWeightKg) },
    { label: 'Received By', value: grn.receivedByName },
    { label: 'Witness', value: grn.witnessName },
    { label: 'Received At', value: formatDateTime(grn.receivedAt) },
    { label: 'Submitted At', value: formatDateTime(grn.submittedAt) },
  ];

  const bagItems = [
    { label: 'Bags on Truck', value: grn.bagsOnTruck !== null ? formatNumber(grn.bagsOnTruck) : '—' },
    { label: 'Bags Damaged', value: grn.bagsDamaged !== null ? formatNumber(grn.bagsDamaged) : '—' },
    { label: 'Bags Accepted', value: grn.bagsAccepted !== null ? formatNumber(grn.bagsAccepted) : '—' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/grn')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          {grn.grnNumber}
        </h1>
        <StatusBadge status={grn.status} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={2} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Bag Count</h3>
        <DescriptionList items={bagItems} columns={3} />
        {grn.conditionNotes && (
          <p className="mt-3 text-sm"><span className="font-semibold">Condition Notes:</span> {grn.conditionNotes}</p>
        )}
        {grn.crossReferenceWarning && (
          <p className="mt-2 text-sm text-amber-600">{grn.crossReferenceWarning}</p>
        )}
      </div>

      {grn.photoUrls.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Condition Photos</h3>
          <div className="flex flex-wrap gap-3">
            {grn.photoUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Condition photo ${i + 1}`}
                className="w-[120px] h-[120px] rounded-lg object-cover border border-slate-200"
              />
            ))}
          </div>
        </div>
      )}

      {grn.lotCreated && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Linked Lot</h3>
          <div className="flex items-center gap-3">
            <DocumentLink type="Lot" id={grn.lotCreated.lotId} number={grn.lotCreated.lotNumber} />
            <span className="text-sm text-slate-600">{formatNumber(grn.lotCreated.totalBags)} bags</span>
          </div>
        </div>
      )}
    </div>
  );
}
