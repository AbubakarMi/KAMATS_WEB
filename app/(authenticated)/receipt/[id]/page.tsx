'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ScanLine, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { DataTable } from '@/components/tables/DataTable';
import {
  useGetReceiptQuery,
  useScanReceiptItemMutation,
  useReportDamageMutation,
  useCompleteReceiptMutation,
  useGetShortageReportQuery,
} from '@/lib/features/receipt/receiptApi';
import { reportDamageSchema, completeReceiptSchema } from '@/lib/schemas/distribution';
import { formatNumber, formatDateTime } from '@/lib/utils/formatters';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import type { BagCondition } from '@/lib/api/types/enums';

interface ReceivedItem { itemId: string; itemCode: string; condition: string; scannedAt: string; damageNotes: string | null; }
interface MissingItem { itemId: string; itemCode: string; }

const receivedColumns: ColumnDef<ReceivedItem, unknown>[] = [
  { accessorKey: 'itemCode', header: 'Item Code' },
  {
    accessorKey: 'condition',
    header: 'Condition',
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          v === 'Good' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>{v}</span>
      );
    },
  },
  { accessorKey: 'scannedAt', header: 'Scanned At', cell: ({ getValue }) => formatDateTime(getValue() as string) },
  { accessorKey: 'damageNotes', header: 'Damage Notes', cell: ({ getValue }) => (getValue() as string | null) ?? '—' },
];

const missingColumns: ColumnDef<MissingItem, unknown>[] = [
  { accessorKey: 'itemCode', header: 'Item Code' },
  { accessorKey: 'itemId', header: 'Item ID' },
];

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: receipt, isLoading, isError, error } = useGetReceiptQuery(id);
  const { data: shortageReport } = useGetShortageReportQuery(id, {
    skip: !receipt || receipt.missingItems.length === 0,
  });

  const [scanItem, { isLoading: scanning }] = useScanReceiptItemMutation();
  const [reportDamage, { isLoading: reportingDamage }] = useReportDamageMutation();
  const [completeReceipt, { isLoading: completing }] = useCompleteReceiptMutation();

  // Scan state
  const [scanInput, setScanInput] = useState('');
  const [scanCondition, setScanCondition] = useState<BagCondition>('Good');

  // Damage report state
  const [damageOpen, setDamageOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const damageForm = useForm({
    resolver: zodResolver(reportDamageSchema) as any,
    defaultValues: { itemId: '', damageNotes: '' },
  });

  // Complete receipt state
  const [completeOpen, setCompleteOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completeForm = useForm({
    resolver: zodResolver(completeReceiptSchema) as any,
    defaultValues: { receiverPinToken: '', notes: '' },
  });

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !receipt) return <DetailPageSkeleton descriptionRows={8} hasTable />;

  const scanProgress = receipt.expectedBags > 0
    ? Math.round((receipt.scannedCount / receipt.expectedBags) * 100)
    : 0;

  const isReceiving = receipt.status === 'Receiving';
  const canComplete = isReceiving && receipt.scannedCount > 0;

  const handleScan = async () => {
    if (!scanInput.trim()) return;
    try {
      const result = await scanItem({
        id, body: { itemId: scanInput.trim(), condition: scanCondition },
      }).unwrap();
      if (result.scanAccepted) {
        toast.success(`Scanned ${result.itemCode} (${result.condition}) — ${result.remaining} remaining`);
      } else {
        toast.error('Scan rejected — item not expected in this receipt');
      }
      setScanInput('');
    } catch {
      toast.error('Failed to scan item');
    }
  };

  const handleReportDamage = async (values: { itemId: string; damageNotes: string }) => {
    try {
      await reportDamage({
        id, body: { itemId: values.itemId, damageNotes: values.damageNotes },
      }).unwrap();
      toast.success('Damage reported');
      setDamageOpen(false);
      damageForm.reset();
    } catch (err) {
      const fallback = setApiFieldErrors(damageForm.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  const handleComplete = async (values: { receiverPinToken: string; notes: string }) => {
    try {
      const result = await completeReceipt({
        id, body: { receiverPinToken: values.receiverPinToken, notes: values.notes || '' },
      }).unwrap();
      toast.success(`Receipt completed — ${result.grdNumber} finalized. ${result.receivedBags} bags received.`);
      setCompleteOpen(false);
    } catch (err) {
      const fallback = setApiFieldErrors(completeForm.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  const items = [
    { label: 'GRD Number', value: receipt.grdNumber },
    { label: 'TDN', value: <DocumentLink type="TDN" id={receipt.tdnId} number={receipt.tdnNumber} /> },
    { label: 'STO', value: <DocumentLink type="STO" id={receipt.stoId} number={receipt.stoNumber} /> },
    {
      label: 'Status',
      value: <StatusBadge status={receipt.status} />,
    },
    { label: 'Source Store', value: receipt.sourceStoreName },
    { label: 'Expected Bags', value: formatNumber(receipt.expectedBags) },
    { label: 'Scanned', value: formatNumber(receipt.scannedCount) },
    { label: 'Arrival', value: formatDateTime(receipt.arrivalAt) },
    { label: 'Created', value: formatDateTime(receipt.createdAt) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/receipt')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Receipt — {receipt.grdNumber}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {isReceiving && (
            <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50" onClick={() => setDamageOpen(true)}>
              <AlertTriangle className="h-4 w-4 mr-1" />Report Damage
            </Button>
          )}
          {canComplete && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setCompleteOpen(true)}>
              <CheckCircle2 className="h-4 w-4 mr-1" />Complete Receipt
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={3} />
      </div>

      {/* Scan Progress */}
      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Scan Progress</h3>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all ${scanProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(scanProgress, 100)}%` }}
          />
        </div>
        <p className="text-sm text-slate-600">
          {formatNumber(receipt.scannedCount)} / {formatNumber(receipt.expectedBags)} bags
          <span className="text-slate-400 ml-2">
            ({receipt.expectedBags - receipt.scannedCount} remaining)
          </span>
        </p>
      </div>

      {/* Scan Items */}
      {isReceiving && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            <ScanLine className="h-4 w-4 inline mr-1.5" />Scan Received Item
          </h3>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px] max-w-sm">
              <Label className="text-xs">Item ID / QR Code</Label>
              <Input
                placeholder="Enter item ID or QR code"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleScan(); } }}
              />
            </div>
            <div>
              <Label className="text-xs">Condition</Label>
              <Select value={scanCondition} onValueChange={(v) => setScanCondition(v as BagCondition)}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScan} disabled={scanning || !scanInput.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
              {scanning ? 'Scanning...' : 'Scan'}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            On mobile, use the camera scanner. On web, enter the item ID manually and press Enter.
          </p>
        </div>
      )}

      {/* Missing Items Warning */}
      {receipt.missingItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-4 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Missing Items Detected</p>
            <p className="text-sm text-amber-700">{receipt.missingItems.length} items were not scanned during receipt.</p>
          </div>
        </div>
      )}

      {/* Received Items Table */}
      {receipt.receivedItems.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Received Items</h3>
          <DataTable<ReceivedItem>
            columns={receivedColumns}
            data={receipt.receivedItems}
            rowKey="itemId"
            showSearch={false}
            showExport={false}
          />
        </div>
      )}

      {/* Missing Items Table */}
      {receipt.missingItems.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Missing Items</h3>
          <DataTable<MissingItem>
            columns={missingColumns}
            data={receipt.missingItems}
            rowKey="itemId"
            showSearch={false}
            showExport={false}
          />
        </div>
      )}

      {/* Shortage Report */}
      {shortageReport && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Shortage Report</h3>
          <DescriptionList items={[
            { label: 'Dispatched', value: `${formatNumber(shortageReport.dispatchedBags)} bags` },
            { label: 'Received', value: `${formatNumber(shortageReport.receivedBags)} bags` },
            { label: 'Shortage', value: `${formatNumber(shortageReport.shortageBags)} bags` },
            {
              label: 'Investigation Status',
              value: (
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  shortageReport.investigationStatus === 'Open' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>{shortageReport.investigationStatus}</span>
              ),
            },
            { label: 'Source', value: shortageReport.sourceStoreName },
            { label: 'Destination', value: shortageReport.destinationStoreName },
          ]} columns={2} />
        </div>
      )}

      {/* Report Damage Dialog */}
      {damageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Report Damage</h3>
            <p className="text-sm text-slate-500 mb-4">Record damage for a specific item in this receipt.</p>
            <form onSubmit={damageForm.handleSubmit(handleReportDamage)} className="space-y-3">
              <div>
                <Label>Item ID</Label>
                <Input placeholder="Enter item ID" {...damageForm.register('itemId')} />
                {damageForm.formState.errors.itemId && (
                  <p className="text-xs text-red-500 mt-0.5">{damageForm.formState.errors.itemId.message as string}</p>
                )}
              </div>
              <div>
                <Label>Damage Notes</Label>
                <Input placeholder="Describe the damage" {...damageForm.register('damageNotes')} />
                {damageForm.formState.errors.damageNotes && (
                  <p className="text-xs text-red-500 mt-0.5">{damageForm.formState.errors.damageNotes.message as string}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDamageOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={reportingDamage} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {reportingDamage ? 'Reporting...' : 'Report Damage'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Receipt Dialog */}
      {completeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Complete Receipt</h3>
            <p className="text-sm text-slate-500 mb-4">
              Finalize the receipt, confirm custody transfer, and generate the Goods Receipt Document (GRD).
            </p>
            <form onSubmit={completeForm.handleSubmit(handleComplete)} className="space-y-3">
              <div>
                <Label>Receiver PIN</Label>
                <Input type="password" placeholder="Enter your PIN to confirm" {...completeForm.register('receiverPinToken')} />
                {completeForm.formState.errors.receiverPinToken && (
                  <p className="text-xs text-red-500 mt-0.5">{completeForm.formState.errors.receiverPinToken.message as string}</p>
                )}
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input placeholder="Any additional notes" {...completeForm.register('notes')} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCompleteOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={completing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {completing ? 'Completing...' : 'Complete & Generate GRD'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
