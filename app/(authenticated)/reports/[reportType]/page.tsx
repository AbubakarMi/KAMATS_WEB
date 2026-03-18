'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import {
  useGetStockSummaryQuery,
  useGetConsumptionAnalyticsReportQuery,
  useGetTransferReconciliationQuery,
  useGetSupplierPerformanceQuery,
  useGetLossSummaryReportQuery,
} from '@/lib/features/reports/reportsApi';
import { formatWeight, formatNumber } from '@/lib/utils/formatters';
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

const reportComponents: Record<string, { title: string; component: React.FC }> = {
  'stock-summary': { title: 'Stock Balance Summary', component: StockSummaryView },
  'consumption-analytics': { title: 'Consumption Analytics', component: ConsumptionAnalyticsView },
  'transfer-reconciliation': { title: 'Transfer Reconciliation', component: TransferReconciliationView },
  'supplier-performance': { title: 'Supplier Performance', component: SupplierPerformanceView },
  'loss-summary': { title: 'Loss Summary', component: LossSummaryView },
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
