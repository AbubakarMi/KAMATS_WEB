'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { DownloadPdfButton } from '@/components/DownloadPdfButton';
import { generateWeighbridgePdf } from '@/lib/utils/pdfGenerators';
import { useGetWeighbridgeTicketQuery } from '@/lib/features/weighbridge/weighbridgeApi';
import { formatWeight, formatPercentage, formatDateTime } from '@/lib/utils/formatters';

export default function WeighbridgeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: ticket, isLoading, isError, error, refetch } = useGetWeighbridgeTicketQuery(id);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !ticket) return <DetailPageSkeleton hasKpiCards kpiCount={3} descriptionRows={6} />;

  const varianceNum = ticket.variancePct ? Math.abs(parseFloat(ticket.variancePct)) : 0;
  const varianceColor = varianceNum <= 2 ? 'text-emerald-600' : varianceNum <= 5 ? 'text-amber-600' : 'text-red-600';

  const items = [
    { label: 'Ticket #', value: ticket.ticketNumber },
    { label: 'Status', value: <StatusBadge status={ticket.status} /> },
    { label: 'PO', value: <DocumentLink type="PO" id={ticket.poId} number={ticket.poNumber} /> },
    { label: 'DVR', value: <DocumentLink type="DVR" id={ticket.dvrId} number={ticket.dvrNumber} /> },
    { label: 'Supplier', value: ticket.supplierName },
    { label: 'Driver', value: `${ticket.driverName} (${ticket.driverIdNumber})` },
    { label: 'Vehicle', value: ticket.vehicleReg },
    { label: 'PO Qty (kg)', value: formatWeight(ticket.poQuantityKg) },
  ];

  const weightItems = [
    {
      label: 'Gross Weight',
      value: (
        <span>
          {formatWeight(ticket.grossWeightKg)}
          {ticket.grossManual && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Manual</span>}
        </span>
      ),
    },
    { label: 'Gross Recorded', value: formatDateTime(ticket.grossWeightAt) },
    {
      label: 'Tare Weight',
      value: (
        <span>
          {formatWeight(ticket.tareWeightKg)}
          {ticket.tareManual && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Manual</span>}
        </span>
      ),
    },
    { label: 'Tare Recorded', value: formatDateTime(ticket.tareWeightAt) },
    { label: 'Net Weight', value: formatWeight(ticket.netWeightKg) },
    {
      label: 'Variance',
      value: ticket.variancePct
        ? <span className={varianceColor}>{formatPercentage(ticket.variancePct)}</span>
        : '—',
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/weighbridge')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            {ticket.ticketNumber}
          </h1>
          <StatusBadge status={ticket.status} />
        </div>
        <DownloadPdfButton onGenerate={() => generateWeighbridgePdf(ticket)} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={2} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Weight Progression</h3>
        <DescriptionList items={weightItems} columns={2} />
      </div>

      {ticket.overrideReason && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Override Details</h3>
          <DescriptionList items={[
            { label: 'Override Reason', value: ticket.overrideReason, span: 2 },
            { label: 'Override At', value: formatDateTime(ticket.overrideAt) },
          ]} columns={2} />
        </div>
      )}

      {ticket.rejectionReason && (
        <div className="rounded-[14px] border border-red-200 bg-red-50 p-4 mb-4">
          <p className="text-sm text-red-700"><span className="font-semibold">Rejection Reason:</span> {ticket.rejectionReason}</p>
        </div>
      )}

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Cross References</h3>
        <div className="flex gap-6">
          <DocumentLink type="PO" id={ticket.poId} number={ticket.poNumber} />
          <DocumentLink type="DVR" id={ticket.dvrId} number={ticket.dvrNumber} />
        </div>
      </div>
    </div>
  );
}
