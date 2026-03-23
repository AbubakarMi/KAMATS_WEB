'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { KpiCard } from '@/components/charts/KpiCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DataTable } from '@/components/tables/DataTable';
import { useCanPerformAction } from '@/lib/hooks';
import { Permissions as P } from '@/lib/utils/permissions';
import {
  useGetConsumptionEntryQuery,
  useScanConsumptionItemMutation,
  useSubmitConsumptionMutation,
  useAcknowledgeAnomalyMutation,
} from '@/lib/features/consumption/consumptionApi';
import { formatWeight, formatNumber, formatDateTime } from '@/lib/utils/formatters';
import { sanitizeString } from '@/lib/utils/sanitize';
import type { ConsumptionItem } from '@/lib/api/types/consumption';

const itemColumns: ColumnDef<ConsumptionItem, unknown>[] = [
  { accessorKey: 'itemCode', header: 'Item Code' },
  { accessorKey: 'lotNumber', header: 'Lot' },
  {
    accessorKey: 'isPartial',
    header: 'Partial',
    cell: ({ getValue }) => {
      const v = getValue() as boolean;
      return v
        ? <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Partial</span>
        : <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">Full</span>;
    },
  },
  { accessorKey: 'weightConsumedKg', header: 'Consumed', cell: ({ getValue }) => formatWeight(getValue() as string) },
  {
    accessorKey: 'remainingWeightKg',
    header: 'Remaining',
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return v ? formatWeight(v) : '—';
    },
  },
  { accessorKey: 'scannedAt', header: 'Scanned', cell: ({ getValue }) => formatDateTime(getValue() as string) },
];

export default function ConsumptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: entry, isLoading, isError, error } = useGetConsumptionEntryQuery(id);
  const [scanItem, { isLoading: scanning }] = useScanConsumptionItemMutation();
  const [submitConsumption, { isLoading: submitting }] = useSubmitConsumptionMutation();
  const [acknowledgeAnomaly] = useAcknowledgeAnomalyMutation();

  // Acknowledge anomaly state
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [ackNotes, setAckNotes] = useState('');

  // Submit confirmation state
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  // Add item state
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [itemId, setItemId] = useState('');
  const [isPartial, setIsPartial] = useState('full');
  const [weightConsumed, setWeightConsumed] = useState('50');
  const [remainingWeight, setRemainingWeight] = useState('');

  const { canPerform: canAcknowledge } = useCanPerformAction(P.CONSUMPTION_ACKNOWLEDGE, entry?.operatorId);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !entry) return <DetailPageSkeleton hasKpiCards kpiCount={4} descriptionRows={10} hasTable />;

  const isEditable = entry.status === 'Submitted';

  const handleAcknowledge = async () => {
    try {
      await acknowledgeAnomaly({ id, body: { acknowledgmentNotes: sanitizeString(ackNotes) } }).unwrap();
      toast.success('Anomaly acknowledged');
      setAckModalOpen(false);
      setAckNotes('');
    } catch {
      toast.error('Failed to acknowledge anomaly');
    }
  };

  const handleSubmit = async () => {
    try {
      await submitConsumption(id).unwrap();
      toast.success('Consumption submitted for confirmation');
    } catch {
      toast.error('Failed to submit consumption');
    }
  };

  const handleAddItem = async () => {
    if (!itemId.trim()) {
      toast.error('Item ID is required');
      return;
    }
    try {
      const partial = isPartial === 'partial';
      await scanItem({
        id,
        body: {
          itemId: itemId.trim(),
          isPartial: partial,
          weightConsumedKg: weightConsumed,
          ...(partial && remainingWeight ? { remainingWeightKg: remainingWeight } : {}),
        },
      }).unwrap();
      toast.success('Item added');
      setAddItemOpen(false);
      setItemId('');
      setIsPartial('full');
      setWeightConsumed('50');
      setRemainingWeight('');
    } catch {
      toast.error('Failed to add item');
    }
  };

  const deviationColor = entry.deviationPct != null
    ? Math.abs(parseFloat(entry.deviationPct)) > 30 ? 'text-red-600'
      : Math.abs(parseFloat(entry.deviationPct)) > 15 ? 'text-amber-600' : ''
    : '';

  const descItems = [
    { label: 'Store', value: entry.storeName },
    { label: 'Operator', value: entry.operatorName },
    { label: 'Session Ref', value: entry.treatmentSessionRef },
    { label: 'Status', value: <StatusBadge status={entry.status} /> },
    { label: 'Standard Rate', value: `${entry.standardDosageRate} kg/m³` },
    { label: 'Seasonal Multiplier', value: entry.seasonalMultiplier },
    {
      label: 'Deviation',
      value: entry.deviationPct != null ? (
        <span className={deviationColor}>
          {parseFloat(entry.deviationPct) > 0 ? '+' : ''}{parseFloat(entry.deviationPct).toFixed(1)}%
        </span>
      ) : '—',
    },
    { label: 'Efficiency Ratio', value: entry.efficiencyRatio ?? '—' },
    {
      label: 'Anomaly Level',
      value: entry.anomalyLevel ? <StatusBadge status={entry.anomalyLevel} /> : '—',
    },
    { label: 'Recorded', value: formatDateTime(entry.recordedAt) },
    ...(entry.supervisorAckByName ? [
      { label: 'Acknowledged By', value: entry.supervisorAckByName },
      { label: 'Acknowledged At', value: entry.supervisorAckAt ? formatDateTime(entry.supervisorAckAt) : '—' },
      ...(entry.supervisorAckNotes ? [
        { label: 'Acknowledgment Notes', value: entry.supervisorAckNotes, span: 3 as const },
      ] : []),
    ] : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/consumption')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          {entry.consumptionNumber}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {isEditable && (
            <>
              <Button variant="outline" onClick={() => setAddItemOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />Add Item
              </Button>
              <Button onClick={() => setSubmitConfirmOpen(true)} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Send className="h-4 w-4 mr-1" />
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </>
          )}
          {entry.status === 'PendingAcknowledgment' && canAcknowledge && (
            <Button onClick={() => setAckModalOpen(true)}>Acknowledge Anomaly</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard title="Volume Treated" value={`${formatNumber(Number(entry.volumeTreatedM3))} m³`} />
        <KpiCard title="Suggested" value={formatWeight(entry.suggestedQtyKg)} />
        <KpiCard title="Actual" value={entry.actualQtyKg ? formatWeight(entry.actualQtyKg) : '—'} />
        <KpiCard title="Bags Used" value={entry.actualQtyBags ?? 0} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={descItems} columns={3} />
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Consumed Items</h3>
          {isEditable && (
            <Button variant="outline" size="sm" onClick={() => setAddItemOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />Add Item
            </Button>
          )}
        </div>
        {entry.items.length > 0 ? (
          <DataTable<ConsumptionItem>
            columns={itemColumns}
            data={entry.items}
            rowKey="itemId"
            showSearch={false}
            showExport={false}
          />
        ) : (
          <p className="text-sm text-slate-500 text-center py-6">No items added yet. Use &quot;Add Item&quot; to record consumed bags.</p>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onOpenChange={(open) => { if (!open) setAddItemOpen(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Consumed Item</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500 mb-3">
            Enter the item ID manually. On mobile, items are scanned via QR code.
          </p>
          <div className="space-y-3">
            <div>
              <Label>Item ID</Label>
              <Input
                placeholder="e.g. item-001 or scan QR code value"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
              />
            </div>
            <div>
              <Label>Consumption Type</Label>
              <Select value={isPartial} onValueChange={setIsPartial}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Bag</SelectItem>
                  <SelectItem value="partial">Partial Bag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Weight Consumed (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={weightConsumed}
                onChange={(e) => setWeightConsumed(e.target.value)}
              />
            </div>
            {isPartial === 'partial' && (
              <div>
                <Label>Remaining Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 22.5"
                  value={remainingWeight}
                  onChange={(e) => setRemainingWeight(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={scanning || !itemId.trim()}>
              {scanning ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation */}
      <ConfirmDialog
        open={submitConfirmOpen}
        onOpenChange={setSubmitConfirmOpen}
        title="Submit Consumption?"
        description="This will submit the consumption entry for confirmation. The system will calculate dosage deviation and flag any anomalies."
        confirmLabel="Submit"
        onConfirm={handleSubmit}
      />

      {/* Acknowledge Anomaly Dialog */}
      <Dialog open={ackModalOpen} onOpenChange={(open) => { if (!open) { setAckModalOpen(false); setAckNotes(''); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Acknowledge Anomaly</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500 mb-2">
            This consumption entry has a {entry.anomalyLevel?.replace(/([A-Z])/g, ' $1').trim()} anomaly.
            Please provide notes explaining the deviation.
          </p>
          <Textarea
            rows={4}
            value={ackNotes}
            onChange={(e) => setAckNotes(e.target.value)}
            placeholder="Enter acknowledgment notes..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAckModalOpen(false); setAckNotes(''); }}>Cancel</Button>
            <Button onClick={handleAcknowledge} disabled={!ackNotes.trim()}>Acknowledge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
