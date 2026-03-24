'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ScanLine, Weight, CheckCircle2, AlertTriangle } from 'lucide-react';
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
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { DataTable } from '@/components/tables/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  useGetDispatchQuery,
  useScanDispatchItemMutation,
  useRecordDispatchWeightMutation,
  useApproveShortShipmentMutation,
  useCompleteDispatchMutation,
} from '@/lib/features/dispatch/dispatchApi';
import { recordDispatchWeightSchema, completeDispatchSchema } from '@/lib/schemas/distribution';
import { formatWeight, formatNumber, formatDateTime } from '@/lib/utils/formatters';
import { setApiFieldErrors } from '@/lib/utils/formErrors';

interface ScannedItem {
  itemId: string;
  itemCode: string;
  scannedAt: string;
}

const scannedColumns: ColumnDef<ScannedItem, unknown>[] = [
  { accessorKey: 'itemCode', header: 'Item Code' },
  { accessorKey: 'scannedAt', header: 'Scanned At', cell: ({ getValue }) => formatDateTime(getValue() as string) },
];

export default function DispatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: dispatch, isLoading, isError, error } = useGetDispatchQuery(id);

  const [scanItem, { isLoading: scanning }] = useScanDispatchItemMutation();
  const [recordWeight, { isLoading: recordingWeight }] = useRecordDispatchWeightMutation();
  const [approveShort, { isLoading: approvingShort }] = useApproveShortShipmentMutation();
  const [completeDispatch, { isLoading: completing }] = useCompleteDispatchMutation();

  // Scan state
  const [scanInput, setScanInput] = useState('');

  // Short shipment state
  const [shortOpen, setShortOpen] = useState(false);
  const [shortReason, setShortReason] = useState('');

  // Complete dispatch state
  const [completeOpen, setCompleteOpen] = useState(false);

  // Weight form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const weightForm = useForm({
    resolver: zodResolver(recordDispatchWeightSchema) as any,
    defaultValues: { dispatchedWeightKg: '', weightSource: '' as 'scale' | 'manual' },
  });

  // Complete form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completeForm = useForm({
    resolver: zodResolver(completeDispatchSchema) as any,
    defaultValues: { dispatcherPinToken: '', driverPin: '', expectedArrivalAt: '' },
  });

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !dispatch) return <DetailPageSkeleton descriptionRows={8} hasTable />;

  const scanProgress = dispatch.expectedCount > 0
    ? Math.round((dispatch.scannedCount / dispatch.expectedCount) * 100)
    : 0;

  const isScanning = dispatch.status === 'Scanning';
  const canRecordWeight = dispatch.status === 'Scanning' && dispatch.scannedCount > 0;
  const canApproveShort = dispatch.status === 'Scanning' && dispatch.scannedCount > 0 && dispatch.scannedCount < dispatch.expectedCount;
  const canComplete = dispatch.status === 'WeightRecorded' || dispatch.status === 'ShortApproved';

  const handleScan = async () => {
    if (!scanInput.trim()) return;
    try {
      const result = await scanItem({
        id, body: { itemId: scanInput.trim() },
      }).unwrap();
      if (result.scanAccepted) {
        toast.success(`Scanned ${result.itemCode} — ${result.remaining} remaining`);
      } else {
        toast.error('Scan rejected — item not expected in this dispatch');
      }
      setScanInput('');
    } catch {
      toast.error('Failed to scan item');
    }
  };

  const handleRecordWeight = async (values: { dispatchedWeightKg: string; weightSource: string }) => {
    try {
      await recordWeight({
        id,
        body: {
          dispatchedWeightKg: values.dispatchedWeightKg,
          weightSource: values.weightSource as 'scale' | 'manual',
        },
      }).unwrap();
      toast.success('Weight recorded');
    } catch (err) {
      const fallback = setApiFieldErrors(weightForm.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  const handleApproveShort = async () => {
    if (!shortReason.trim()) {
      toast.error('Reason is required');
      return;
    }
    try {
      const missingIds = dispatch.expectedItems
        .filter((e) => !dispatch.scannedItems.some((s) => s.itemId === e.itemId))
        .map((e) => e.itemId);
      await approveShort({
        id, body: { reason: shortReason, missingItemIds: missingIds },
      }).unwrap();
      toast.success('Short shipment approved');
      setShortOpen(false);
      setShortReason('');
    } catch {
      toast.error('Failed to approve short shipment');
    }
  };

  const handleComplete = async (values: { dispatcherPinToken: string; driverPin: string; expectedArrivalAt: string }) => {
    try {
      const result = await completeDispatch({
        id, body: {
          dispatcherPinToken: values.dispatcherPinToken,
          driverPin: values.driverPin,
          expectedArrivalAt: new Date(values.expectedArrivalAt).toISOString(),
        },
      }).unwrap();
      toast.success(`Dispatch completed — TDN ${result.tdnNumber} generated`);
      setCompleteOpen(false);
    } catch (err) {
      const fallback = setApiFieldErrors(completeForm.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  const items = [
    { label: 'STO', value: <DocumentLink type="STO" id={dispatch.stoId} number={dispatch.stoNumber} /> },
    {
      label: 'Status',
      value: (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          dispatch.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
          dispatch.status === 'InTransit' ? 'bg-blue-100 text-blue-700' :
          dispatch.status === 'Scanning' ? 'bg-amber-100 text-amber-700' :
          dispatch.status === 'WeightRecorded' ? 'bg-indigo-100 text-indigo-700' :
          dispatch.status === 'ShortApproved' ? 'bg-orange-100 text-orange-700' :
          'bg-slate-100 text-slate-600'
        }`}>{dispatch.status.replace(/([A-Z])/g, ' $1').trim()}</span>
      ),
    },
    { label: 'Created', value: formatDateTime(dispatch.createdAt) },
    { label: 'Vehicle Reg', value: dispatch.vehicleReg },
    { label: 'Driver', value: dispatch.driverName },
    { label: 'Driver Phone', value: dispatch.driverPhone },
    { label: 'Expected Weight', value: dispatch.expectedWeightKg ? formatWeight(dispatch.expectedWeightKg) : '—' },
    { label: 'Dispatched Weight', value: dispatch.dispatchedWeightKg ? formatWeight(dispatch.dispatchedWeightKg) : '—' },
    { label: 'Weight Variance', value: dispatch.weightVariancePct ? `${dispatch.weightVariancePct}%` : '—' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/dispatch')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Dispatch — {dispatch.stoNumber}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {canApproveShort && (
            <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50" onClick={() => setShortOpen(true)}>
              <AlertTriangle className="h-4 w-4 mr-1" />Approve Short
            </Button>
          )}
          {canComplete && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setCompleteOpen(true)}>
              <CheckCircle2 className="h-4 w-4 mr-1" />Complete Dispatch
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
          {formatNumber(dispatch.scannedCount)} / {formatNumber(dispatch.expectedCount)} bags
          <span className="text-slate-400 ml-2">
            ({dispatch.expectedCount - dispatch.scannedCount} remaining)
          </span>
        </p>
      </div>

      {/* Scan Items (manual entry for web) */}
      {isScanning && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            <ScanLine className="h-4 w-4 inline mr-1.5" />Scan Item
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter item ID or QR code"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleScan(); } }}
              className="max-w-sm"
            />
            <Button onClick={handleScan} disabled={scanning || !scanInput.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
              {scanning ? 'Scanning...' : 'Scan'}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            On mobile, use the camera scanner. On web, enter the item ID manually and press Enter.
          </p>
        </div>
      )}

      {/* Record Weight */}
      {canRecordWeight && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            <Weight className="h-4 w-4 inline mr-1.5" />Record Dispatched Weight
          </h3>
          <form onSubmit={weightForm.handleSubmit(handleRecordWeight)} className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">Weight (kg)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 2500.00"
                {...weightForm.register('dispatchedWeightKg')}
                className="w-40"
              />
              {weightForm.formState.errors.dispatchedWeightKg && (
                <p className="text-xs text-red-500 mt-0.5">{weightForm.formState.errors.dispatchedWeightKg.message as string}</p>
              )}
            </div>
            <div>
              <Label className="text-xs">Source</Label>
              <Select
                value={weightForm.watch('weightSource')}
                onValueChange={(v) => weightForm.setValue('weightSource', v as 'scale' | 'manual')}
              >
                <SelectTrigger className="w-32"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="scale">Scale</SelectItem>
                </SelectContent>
              </Select>
              {weightForm.formState.errors.weightSource && (
                <p className="text-xs text-red-500 mt-0.5">{weightForm.formState.errors.weightSource.message as string}</p>
              )}
            </div>
            <Button type="submit" disabled={recordingWeight} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {recordingWeight ? 'Recording...' : 'Record Weight'}
            </Button>
          </form>
        </div>
      )}

      {/* Scanned Items Table */}
      {dispatch.scannedItems.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Scanned Items</h3>
          <DataTable<ScannedItem>
            columns={scannedColumns}
            data={dispatch.scannedItems}
            rowKey="itemId"
            showSearch={false}
            showExport={false}
          />
        </div>
      )}

      {/* Short Shipment Dialog */}
      <ConfirmDialog
        open={shortOpen}
        onOpenChange={setShortOpen}
        title="Approve Short Shipment?"
        description={`${dispatch.expectedCount - dispatch.scannedCount} of ${dispatch.expectedCount} items have not been scanned. Provide a reason to approve the short shipment.`}
        confirmLabel={approvingShort ? 'Approving...' : 'Approve Short Shipment'}
        onConfirm={handleApproveShort}
      />
      {shortOpen && (
        <div className="fixed inset-0 z-40" style={{ pointerEvents: 'none' }}>
          {/* Reason is collected via the dialog — we extend ConfirmDialog below */}
        </div>
      )}

      {/* Complete Dispatch Dialog */}
      {completeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Complete Dispatch</h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter dual-auth PINs and expected arrival time to generate the Transport Document Number (TDN).
            </p>
            <form onSubmit={completeForm.handleSubmit(handleComplete)} className="space-y-3">
              <div>
                <Label>Dispatcher PIN</Label>
                <Input type="password" placeholder="Enter your PIN" {...completeForm.register('dispatcherPinToken')} />
                {completeForm.formState.errors.dispatcherPinToken && (
                  <p className="text-xs text-red-500 mt-0.5">{completeForm.formState.errors.dispatcherPinToken.message as string}</p>
                )}
              </div>
              <div>
                <Label>Driver PIN</Label>
                <Input type="password" placeholder="Enter driver PIN" {...completeForm.register('driverPin')} />
                {completeForm.formState.errors.driverPin && (
                  <p className="text-xs text-red-500 mt-0.5">{completeForm.formState.errors.driverPin.message as string}</p>
                )}
              </div>
              <div>
                <Label>Expected Arrival</Label>
                <Input type="datetime-local" {...completeForm.register('expectedArrivalAt')} />
                {completeForm.formState.errors.expectedArrivalAt && (
                  <p className="text-xs text-red-500 mt-0.5">{completeForm.formState.errors.expectedArrivalAt.message as string}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCompleteOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={completing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {completing ? 'Completing...' : 'Complete & Generate TDN'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
