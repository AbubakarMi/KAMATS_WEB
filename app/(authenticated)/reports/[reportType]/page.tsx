'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import {
  useGetStockSummaryQuery,
  useGetConsumptionAnalyticsReportQuery,
  useGetTransferReconciliationQuery,
  useGetSupplierPerformanceQuery,
  useGetLossSummaryReportQuery,
  useGetLotLifecycleReportQuery,
  useGetItemHistoryReportQuery,
} from '@/lib/features/reports/reportsApi';
import { useGetLotsQuery } from '@/lib/features/inventory/lotsApi';
import { useGetLotQuery } from '@/lib/features/inventory/lotsApi';
import { formatWeight, formatNumber, formatDate, formatDateTime } from '@/lib/utils/formatters';
import type { StoreStockSummary } from '@/lib/api/types/reports';

function StockSummaryView() {
  const { data, isLoading } = useGetStockSummaryQuery();
  if (isLoading || !data) return <DetailPageSkeleton descriptionRows={6} />;

  return (
    <>
      <div className="flex gap-6 text-sm font-semibold mb-4">
        <span>System Total: {formatNumber(data.systemTotalBags)} bags</span>
        <span>Total Weight: {formatWeight(data.systemTotalWeightKg)}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 text-slate-500 font-medium">Store</th>
            <th className="text-left py-2 text-slate-500 font-medium">Tier</th>
            <th className="text-right py-2 text-slate-500 font-medium">Bags</th>
            <th className="text-right py-2 text-slate-500 font-medium">Weight</th>
            <th className="text-right py-2 text-slate-500 font-medium">Reorder Pt</th>
            <th className="text-left py-2 text-slate-500 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.stores.map((s: StoreStockSummary) => (
            <tr key={s.storeId} className="border-b border-slate-50">
              <td className="py-2">{s.storeName}</td>
              <td className="py-2">{s.tier}</td>
              <td className="text-right py-2">{formatNumber(s.totalBags)}</td>
              <td className="text-right py-2">{formatWeight(s.totalWeightKg)}</td>
              <td className="text-right py-2">{s.reorderPoint}</td>
              <td className="py-2">
                {s.belowReorderPoint
                  ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Below Reorder</span>
                  : <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">OK</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function ConsumptionAnalyticsView() {
  const { data, isLoading } = useGetConsumptionAnalyticsReportQuery();
  if (isLoading || !data) return <DetailPageSkeleton descriptionRows={6} />;

  return (
    <>
      <p className="text-sm text-slate-500 mb-3">{data.period.from} to {data.period.to}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 text-slate-500 font-medium">Store</th>
            <th className="text-right py-2 text-slate-500 font-medium">Volume (m³)</th>
            <th className="text-right py-2 text-slate-500 font-medium">Consumed</th>
            <th className="text-right py-2 text-slate-500 font-medium">Avg Rate</th>
            <th className="text-right py-2 text-slate-500 font-medium">Configured</th>
            <th className="text-right py-2 text-slate-500 font-medium">Anomalies</th>
            <th className="text-right py-2 text-slate-500 font-medium">Anomaly %</th>
          </tr>
        </thead>
        <tbody>
          {data.stores.map((s) => {
            const pct = parseFloat(s.anomalyRatePct);
            const color = pct > 10 ? 'text-red-600' : pct > 5 ? 'text-amber-600' : 'text-emerald-600';
            return (
              <tr key={s.storeId} className="border-b border-slate-50">
                <td className="py-2">{s.storeName}</td>
                <td className="text-right py-2">{formatNumber(Number(s.totalVolumeM3))}</td>
                <td className="text-right py-2">{formatWeight(s.totalConsumedKg)}</td>
                <td className="text-right py-2">{s.avgRateKgM3}</td>
                <td className="text-right py-2">{s.configuredRate}</td>
                <td className="text-right py-2">{s.anomalyCount}</td>
                <td className={`text-right py-2 ${color}`}>{pct.toFixed(1)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function TransferReconciliationView() {
  const { data, isLoading } = useGetTransferReconciliationQuery();
  if (isLoading || !data) return <DetailPageSkeleton descriptionRows={6} />;

  return (
    <>
      <p className="text-sm text-slate-500 mb-3">{data.period.from} to {data.period.to}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 text-slate-500 font-medium">STO</th>
            <th className="text-left py-2 text-slate-500 font-medium">Source</th>
            <th className="text-left py-2 text-slate-500 font-medium">Destination</th>
            <th className="text-right py-2 text-slate-500 font-medium">Dispatched</th>
            <th className="text-right py-2 text-slate-500 font-medium">Received</th>
            <th className="text-right py-2 text-slate-500 font-medium">Shortage</th>
            <th className="text-right py-2 text-slate-500 font-medium">Damaged</th>
            <th className="text-left py-2 text-slate-500 font-medium">TDN Status</th>
            <th className="text-left py-2 text-slate-500 font-medium">Investigation</th>
          </tr>
        </thead>
        <tbody>
          {data.transfers.map((t) => (
            <tr key={t.stoNumber} className="border-b border-slate-50">
              <td className="py-2">{t.stoNumber}</td>
              <td className="py-2">{t.sourceStore}</td>
              <td className="py-2">{t.destinationStore}</td>
              <td className="text-right py-2">{t.dispatchedBags}</td>
              <td className="text-right py-2">{t.receivedBags}</td>
              <td className="text-right py-2">{t.shortageBags > 0 ? <span className="text-red-600">{t.shortageBags}</span> : '0'}</td>
              <td className="text-right py-2">{t.damagedBags}</td>
              <td className="py-2"><StatusBadge status={t.tdnStatus} /></td>
              <td className="py-2">{t.investigationStatus ? <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{t.investigationStatus}</span> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function SupplierPerformanceView() {
  const { data, isLoading } = useGetSupplierPerformanceQuery();
  if (isLoading || !data) return <DetailPageSkeleton descriptionRows={6} />;

  return (
    <>
      <p className="text-sm text-slate-500 mb-3">{data.period.from} to {data.period.to}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 text-slate-500 font-medium">Supplier</th>
            <th className="text-right py-2 text-slate-500 font-medium">Deliveries</th>
            <th className="text-right py-2 text-slate-500 font-medium">On-Time %</th>
            <th className="text-right py-2 text-slate-500 font-medium">Qty Accuracy %</th>
            <th className="text-right py-2 text-slate-500 font-medium">Quality Accept %</th>
            <th className="text-right py-2 text-slate-500 font-medium">Avg Score</th>
          </tr>
        </thead>
        <tbody>
          {data.suppliers.map((s) => {
            const score = parseFloat(s.avgScore);
            const color = score >= 90 ? 'text-emerald-600' : score >= 75 ? 'text-amber-600' : 'text-red-600';
            return (
              <tr key={s.supplierId} className="border-b border-slate-50">
                <td className="py-2">{s.supplierName}</td>
                <td className="text-right py-2">{s.totalDeliveries}</td>
                <td className="text-right py-2">{s.onTimeRate}%</td>
                <td className="text-right py-2">{s.quantityAccuracy}%</td>
                <td className="text-right py-2">{s.qualityAcceptance}%</td>
                <td className={`text-right py-2 font-semibold ${color}`}>{score.toFixed(1)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function LossSummaryView() {
  const { data, isLoading } = useGetLossSummaryReportQuery();
  if (isLoading || !data) return <DetailPageSkeleton descriptionRows={4} />;

  return (
    <>
      <div className="flex gap-6 text-sm font-semibold mb-4">
        <span>Total Write-Offs: {data.totalWriteOffs}</span>
        <span>Total Bags: {formatNumber(data.totalBags)}</span>
        <span>Loss Rate: {data.lossRatePct}%</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 text-slate-500 font-medium">Category</th>
            <th className="text-right py-2 text-slate-500 font-medium">Count</th>
            <th className="text-right py-2 text-slate-500 font-medium">Bags</th>
            <th className="text-right py-2 text-slate-500 font-medium">Weight</th>
          </tr>
        </thead>
        <tbody>
          {data.byCategory.map((c) => (
            <tr key={c.category} className="border-b border-slate-50">
              <td className="py-2">{c.category.replace(/([A-Z])/g, ' $1').trim()}</td>
              <td className="text-right py-2">{c.count}</td>
              <td className="text-right py-2">{c.totalBags}</td>
              <td className="text-right py-2">{formatWeight(c.totalWeightKg)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const eventTypeLabels: Record<string, string> = {
  GRN_RECEIVED: 'GRN Received',
  LABELS_GENERATED: 'Labels Generated',
  LABEL_GENERATED: 'Label Generated',
  PUT_AWAY: 'Put Away',
  TRANSFER_DISPATCH: 'Transfer Dispatched',
  TRANSFER_RECEIPT: 'Transfer Received',
  CONSUMPTION: 'Consumption',
  WRITE_OFF: 'Write-Off',
  QUARANTINE: 'Quarantined',
  RETURN: 'Returned',
};

const eventTypeColors: Record<string, string> = {
  GRN_RECEIVED: 'bg-blue-100 text-blue-700',
  LABELS_GENERATED: 'bg-indigo-100 text-indigo-700',
  LABEL_GENERATED: 'bg-indigo-100 text-indigo-700',
  PUT_AWAY: 'bg-slate-100 text-slate-700',
  TRANSFER_DISPATCH: 'bg-amber-100 text-amber-700',
  TRANSFER_RECEIPT: 'bg-emerald-100 text-emerald-700',
  CONSUMPTION: 'bg-violet-100 text-violet-700',
  WRITE_OFF: 'bg-red-100 text-red-700',
  QUARANTINE: 'bg-orange-100 text-orange-700',
  RETURN: 'bg-cyan-100 text-cyan-700',
};

function LotLifecycleView() {
  const [selectedLotId, setSelectedLotId] = useState('');
  const { data: lotsData } = useGetLotsQuery({ page: 1, pageSize: 200 });
  const { data, isLoading, isError } = useGetLotLifecycleReportQuery(selectedLotId, { skip: !selectedLotId });
  const lots = lotsData?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Label>Select Lot</Label>
        <Select value={selectedLotId} onValueChange={setSelectedLotId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a lot..." />
          </SelectTrigger>
          <SelectContent>
            {lots.map((lot) => (
              <SelectItem key={lot.id} value={lot.id}>
                {lot.lotNumber} — {lot.supplierName} ({formatNumber(lot.totalBags)} bags)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedLotId && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-8 justify-center">
          <Search className="h-4 w-4" />
          <span>Select a lot to view its lifecycle report</span>
        </div>
      )}

      {selectedLotId && isLoading && <DetailPageSkeleton descriptionRows={6} />}

      {selectedLotId && isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Failed to load lot lifecycle report.</p>
        </div>
      )}

      {data && (
        <>
          {/* Lot header */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><span className="text-slate-500">Lot Number:</span> <span className="font-medium">{data.lotNumber}</span></div>
            <div><span className="text-slate-500">PO:</span> <span className="font-medium">{data.poNumber}</span></div>
            <div><span className="text-slate-500">Supplier:</span> <span className="font-medium">{data.supplierName}</span></div>
            <div><span className="text-slate-500">GRN:</span> <span className="font-medium">{data.grnNumber}</span></div>
            <div><span className="text-slate-500">Receipt Date:</span> <span className="font-medium">{formatDate(data.receiptDate)}</span></div>
            <div><span className="text-slate-500">Total Bags:</span> <span className="font-medium">{formatNumber(data.totalBags)}</span></div>
          </div>

          {/* Current distribution */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Current Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.currentDistribution).map(([store, bags]) => (
                <span key={store} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                  {store}: <span className="font-semibold">{bags}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Lifecycle Events</h3>
            <div className="relative space-y-0">
              {data.events.map((event, i) => (
                <div key={i} className="flex gap-3 pb-4 relative">
                  {/* Timeline line */}
                  {i < data.events.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-200" />
                  )}
                  {/* Dot */}
                  <div className="relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-slate-300 bg-white" />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${eventTypeColors[event.eventType] ?? 'bg-slate-100 text-slate-700'}`}>
                        {eventTypeLabels[event.eventType] ?? event.eventType}
                      </span>
                      <span className="text-xs text-slate-400">{formatDateTime(event.timestamp)}</span>
                    </div>
                    <p className="text-sm text-slate-700">{event.description}</p>
                    <p className="text-xs text-slate-500">
                      {event.actorName} · {event.storeName} · {event.quantity} bags
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ItemHistoryView() {
  const [selectedLotId, setSelectedLotId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');

  const { data: lotsData } = useGetLotsQuery({ page: 1, pageSize: 200 });
  const { data: lotDetail } = useGetLotQuery(selectedLotId, { skip: !selectedLotId });
  const { data, isLoading, isError } = useGetItemHistoryReportQuery(selectedItemId, { skip: !selectedItemId });

  const lots = lotsData?.data ?? [];
  const items = lotDetail?.items ?? [];

  const handleLotChange = (lotId: string) => {
    setSelectedLotId(lotId);
    setSelectedItemId('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <Label>Select Lot</Label>
          <Select value={selectedLotId} onValueChange={handleLotChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a lot..." />
            </SelectTrigger>
            <SelectContent>
              {lots.map((lot) => (
                <SelectItem key={lot.id} value={lot.id}>
                  {lot.lotNumber} — {lot.supplierName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Select Item</Label>
          <Select value={selectedItemId} onValueChange={setSelectedItemId} disabled={!selectedLotId}>
            <SelectTrigger>
              <SelectValue placeholder={selectedLotId ? 'Choose an item...' : 'Select a lot first'} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.itemCode} — <StatusBadge status={item.status} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedItemId && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-8 justify-center">
          <Search className="h-4 w-4" />
          <span>Select a lot and item to view its chain of custody</span>
        </div>
      )}

      {selectedItemId && isLoading && <DetailPageSkeleton descriptionRows={6} />}

      {selectedItemId && isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Failed to load item history report.</p>
        </div>
      )}

      {data && (
        <>
          {/* Item header */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><span className="text-slate-500">Item Code:</span> <span className="font-medium">{data.itemCode}</span></div>
            <div><span className="text-slate-500">Lot:</span> <span className="font-medium">{data.lotNumber}</span></div>
            <div><span className="text-slate-500">PO:</span> <span className="font-medium">{data.poNumber}</span></div>
            <div><span className="text-slate-500">Supplier:</span> <span className="font-medium">{data.supplierName}</span></div>
            <div><span className="text-slate-500">Status:</span> <StatusBadge status={data.currentStatus} /></div>
            <div><span className="text-slate-500">Current Store:</span> <span className="font-medium">{data.currentStoreName}</span></div>
            {data.currentLocationCode && (
              <div><span className="text-slate-500">Location:</span> <span className="font-medium">{data.currentLocationCode}</span></div>
            )}
          </div>

          {/* Chain of custody timeline */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Chain of Custody</h3>
            <div className="relative space-y-0">
              {data.chainOfCustody.map((event, i) => (
                <div key={i} className="flex gap-3 pb-4 relative">
                  {i < data.chainOfCustody.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-200" />
                  )}
                  <div className="relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-slate-300 bg-white" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${eventTypeColors[event.eventType] ?? 'bg-slate-100 text-slate-700'}`}>
                        {eventTypeLabels[event.eventType] ?? event.eventType}
                      </span>
                      <span className="text-xs text-slate-400">{formatDateTime(event.timestamp)}</span>
                    </div>
                    <p className="text-sm text-slate-700">{event.details}</p>
                    <p className="text-xs text-slate-500">
                      {event.actorName} · {event.storeName}
                      {event.locationCode && ` · ${event.locationCode}`}
                      {event.referenceNumber && ` · ${event.referenceNumber}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const reportComponents: Record<string, { title: string; component: React.FC }> = {
  'stock-summary': { title: 'Stock Balance Summary', component: StockSummaryView },
  'consumption-analytics': { title: 'Consumption Analytics', component: ConsumptionAnalyticsView },
  'transfer-reconciliation': { title: 'Transfer Reconciliation', component: TransferReconciliationView },
  'supplier-performance': { title: 'Supplier Performance', component: SupplierPerformanceView },
  'loss-summary': { title: 'Loss Summary', component: LossSummaryView },
  'lot-lifecycle': { title: 'Lot Lifecycle', component: LotLifecycleView },
  'item-history': { title: 'Item History', component: ItemHistoryView },
};

export default function ReportViewerPage() {
  const { reportType } = useParams<{ reportType: string }>();
  const router = useRouter();

  const report = reportComponents[reportType];

  if (!report) {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={() => router.push('/reports')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Reports
        </Button>
        <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Unknown report type</p>
        </div>
      </div>
    );
  }

  const ReportComponent = report.component;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/reports')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
      </div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-4">
        {report.title}
      </h1>
      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <ReportComponent />
      </div>
    </div>
  );
}
