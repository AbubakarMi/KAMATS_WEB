'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

import { KpiCard } from '@/components/charts/KpiCard';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { useGetLossSummaryQuery } from '@/lib/features/loss/lossApi';
import { formatWeight, formatNumber } from '@/lib/utils/formatters';
import type { LossCategoryBreakdown, StoreLossSummary } from '@/lib/api/types/loss';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function LossSummaryPage() {
  const { data: summary, isLoading } = useGetLossSummaryQuery();

  if (isLoading || !summary) return <DetailPageSkeleton hasKpiCards kpiCount={4} descriptionRows={4} />;

  const pieData = summary.byCategory.map((c) => ({
    name: c.category.replace(/([A-Z])/g, ' $1').trim(),
    value: c.totalBags,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-1">
        Loss Summary
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        {summary.period.from} to {summary.period.to}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard title="Total Write-Offs" value={summary.totalWriteOffs} />
        <KpiCard title="Total Bags Lost" value={formatNumber(summary.totalBags)} />
        <KpiCard title="Total Weight Lost" value={formatWeight(summary.totalWeightKg)} />
        <KpiCard title="Loss Rate" value={`${summary.lossRatePct}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Pie chart + category table */}
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">By Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-1.5 text-slate-500 font-medium">Category</th>
                <th className="text-right py-1.5 text-slate-500 font-medium">Count</th>
                <th className="text-right py-1.5 text-slate-500 font-medium">Bags</th>
                <th className="text-right py-1.5 text-slate-500 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {summary.byCategory.map((c: LossCategoryBreakdown) => (
                <tr key={c.category} className="border-b border-slate-50">
                  <td className="py-1.5"><StatusBadge status={c.category} /></td>
                  <td className="text-right py-1.5">{c.count}</td>
                  <td className="text-right py-1.5">{formatNumber(c.totalBags)}</td>
                  <td className="text-right py-1.5">{formatWeight(c.totalWeightKg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Area chart — monthly trend */}
        <div className="lg:col-span-2 rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={summary.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="bags" orientation="left" />
              <YAxis yAxisId="pct" orientation="right" />
              <Tooltip />
              <Legend />
              <Area yAxisId="bags" type="monotone" dataKey="totalBags" name="Bags Lost" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
              <Area yAxisId="pct" type="monotone" dataKey="lossRatePct" name="Loss Rate %" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Loss by store */}
      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Loss by Store</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 text-slate-500 font-medium">Store</th>
              <th className="text-right py-2 text-slate-500 font-medium">Bags</th>
              <th className="text-right py-2 text-slate-500 font-medium">Weight</th>
              <th className="text-right py-2 text-slate-500 font-medium">Loss Rate</th>
            </tr>
          </thead>
          <tbody>
            {summary.byStore.map((s: StoreLossSummary) => {
              const pct = parseFloat(s.lossRatePct);
              const color = pct > 3 ? 'text-red-600' : pct > 1.5 ? 'text-amber-600' : 'text-emerald-600';
              return (
                <tr key={s.storeId} className="border-b border-slate-50">
                  <td className="py-2">{s.storeName}</td>
                  <td className="text-right py-2">{formatNumber(s.totalBags)}</td>
                  <td className="text-right py-2">{formatWeight(s.totalWeightKg)}</td>
                  <td className={`text-right py-2 font-semibold ${color}`}>{pct.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
