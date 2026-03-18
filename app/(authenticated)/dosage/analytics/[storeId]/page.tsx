'use client';

import { useParams } from 'next/navigation';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

import { KpiCard } from '@/components/charts/KpiCard';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import {
  useGetConsumptionAnalyticsQuery,
  useGetConsumptionTrendsQuery,
  useGetOperatorPatternsQuery,
} from '@/lib/features/dosage/dosageApi';
import { formatWeight, formatNumber } from '@/lib/utils/formatters';
import type { OperatorPattern } from '@/lib/api/types/consumption';

export default function DosageAnalyticsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: analytics, isLoading } = useGetConsumptionAnalyticsQuery(storeId);
  const { data: trends } = useGetConsumptionTrendsQuery(storeId);
  const { data: operatorData } = useGetOperatorPatternsQuery(storeId);

  if (isLoading || !analytics) return <DetailPageSkeleton hasKpiCards kpiCount={6} descriptionRows={4} />;

  const { summary } = analytics;
  const trendArrow = trends?.rolling30DayTrend === 'up' ? '↑' : trends?.rolling30DayTrend === 'down' ? '↓' : '↔';

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-1">
        {analytics.storeName} — Consumption Analytics
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        {analytics.period.from} to {analytics.period.to}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-4">
        <KpiCard title="Entries" value={summary.totalEntries} />
        <KpiCard title="Volume (m³)" value={formatNumber(Number(summary.totalVolumeM3))} />
        <KpiCard title="Consumed" value={formatWeight(summary.totalConsumedKg)} />
        <KpiCard title="Avg Rate" value={`${summary.averageRateKgM3} kg/m³`} />
        <KpiCard title="Anomaly Rate" value={`${summary.anomalyRatePct}%`} />
        <KpiCard title="30-Day Trend" value={`${trends?.rolling30DayRate ?? '—'} ${trendArrow}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Anomaly Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(analytics.anomalyBreakdown).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <StatusBadge status={level} />
                <span className="text-sm font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="sm:col-span-3 rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Daily Consumption</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analytics.dailyConsumption}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="consumedKg" name="Consumed (kg)" stroke="#1e40af" fill="#1e40af" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {trends && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-[14px] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Delivery vs Consumption</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trends.deliveryVsConsumption}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="receivedKg" name="Received (kg)" fill="#22c55e" />
                <Bar dataKey="consumedKg" name="Consumed (kg)" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-[14px] border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Lot Consumption Velocity</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-500 font-medium">Lot</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Bags/Day</th>
                </tr>
              </thead>
              <tbody>
                {trends.lotConsumptionVelocity.map((l) => (
                  <tr key={l.lotNumber} className="border-b border-slate-50">
                    <td className="py-2">{l.lotNumber}</td>
                    <td className="text-right py-2">{l.bagsPerDay.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {operatorData && operatorData.operators.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Operator Patterns</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-500 font-medium">Operator</th>
                <th className="text-right py-2 text-slate-500 font-medium">Entries</th>
                <th className="text-right py-2 text-slate-500 font-medium">Avg Rate (kg/m³)</th>
                <th className="text-right py-2 text-slate-500 font-medium">Anomalies</th>
                <th className="text-right py-2 text-slate-500 font-medium">Anomaly Rate</th>
              </tr>
            </thead>
            <tbody>
              {operatorData.operators.map((op: OperatorPattern) => {
                const pct = parseFloat(op.anomalyRatePct);
                const color = pct > 10 ? 'text-red-600' : pct > 5 ? 'text-amber-600' : 'text-emerald-600';
                return (
                  <tr key={op.operatorId} className="border-b border-slate-50">
                    <td className="py-2">{op.operatorName}</td>
                    <td className="text-right py-2">{op.totalEntries}</td>
                    <td className="text-right py-2">{op.avgRateKgM3}</td>
                    <td className="text-right py-2">{op.anomalyCount}</td>
                    <td className={`text-right py-2 font-semibold ${color}`}>{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
