'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { TimelineView } from '@/components/data-display/TimelineView';
import type { TimelineEvent } from '@/components/data-display/TimelineView';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { useGetItemQuery, useGetItemLifecycleQuery } from '@/lib/features/inventory/itemsApi';
import { formatWeight, formatDate, formatDateTime } from '@/lib/utils/formatters';

const eventColors: Record<string, string> = {
  GRN_RECEIVED: 'green',
  LABEL_GENERATED: 'blue',
  PUT_AWAY: 'cyan',
  TRANSFER_DISPATCH: 'orange',
  TRANSFER_RECEIPT: 'geekblue',
  CONSUMPTION: 'purple',
  WRITE_OFF: 'red',
};

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: item, isLoading, isError, error, refetch } = useGetItemQuery(id);
  const { data: lifecycle } = useGetItemLifecycleQuery(id);

  const handleCopyQR = () => {
    if (item?.qrCode) {
      navigator.clipboard.writeText(item.qrCode);
      toast.success('QR code copied');
    }
  };

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !item) return <DetailPageSkeleton descriptionRows={8} />;

  const stdWeight = parseFloat(item.standardWeightKg);
  const remaining = parseFloat(item.remainingWeightKg);
  const gaugeColor = remaining / stdWeight > 0.5 ? '#22c55e' : remaining / stdWeight > 0.2 ? '#f59e0b' : '#ef4444';

  const timelineEvents: TimelineEvent[] = lifecycle?.events.map((e) => ({
    timestamp: e.timestamp,
    title: e.eventType.replace(/_/g, ' '),
    description: e.details,
    actor: e.actorName,
    color: eventColors[e.eventType] || 'blue',
  })) ?? [];

  const items = [
    { label: 'Item Code', value: item.itemCode },
    { label: 'Status', value: <StatusBadge status={item.status} /> },
    {
      label: 'QR Code',
      value: (
        <span className="flex items-center gap-2">
          <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{item.qrCode}</code>
          <Button variant="ghost" size="sm" onClick={handleCopyQR}><Copy className="h-3.5 w-3.5" /></Button>
        </span>
      ),
    },
    { label: 'Lot', value: <DocumentLink type="Lot" id={item.lotId} number={item.lotNumber} /> },
    { label: 'Store', value: item.currentStoreName },
    { label: 'Location', value: item.locationCode || '—' },
    { label: 'Std Weight', value: formatWeight(item.standardWeightKg) },
    { label: 'Remaining', value: formatWeight(item.remainingWeightKg) },
    { label: 'PO', value: item.poNumber },
    { label: 'Supplier', value: item.supplierName },
    { label: 'Receipt Date', value: formatDate(item.receiptDate) },
    { label: 'Labelled', value: item.labelledAt ? formatDateTime(item.labelledAt) : '—' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          {item.itemCode}
        </h1>
        <StatusBadge status={item.status} />
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 rounded-[14px] border border-slate-200 bg-white p-6">
          <DescriptionList items={items} columns={2} />
        </div>
        <div className="w-[220px] rounded-[14px] border border-slate-200 bg-white p-6 flex items-center justify-center">
          <GaugeChart
            value={remaining}
            max={stdWeight}
            label={`of ${formatWeight(item.standardWeightKg)}`}
            color={gaugeColor}
          />
        </div>
      </div>

      {timelineEvents.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Item Lifecycle</h3>
          <TimelineView events={timelineEvents} />
        </div>
      )}
    </div>
  );
}
