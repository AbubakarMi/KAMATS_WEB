'use client';

import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import {
  Database, Bell, AlertTriangle, ArrowLeftRight,
  CheckCircle, AlertCircle, Package, TrendingDown,
} from 'lucide-react';
import { KpiCard } from '@/components/charts/KpiCard';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { Badge } from '@/components/ui/badge';
import {
  useGetStockSummaryQuery,
  useGetLossSummaryReportQuery,
  useGetTransferReconciliationQuery,
} from '@/lib/features/reports/reportsApi';
import { useGetAlertsQuery } from '@/lib/features/alerts/alertsApi';
import { formatNumber, formatWeight, formatDateTime } from '@/lib/utils/formatters';
import { alertSeverityColors } from '@/lib/utils/statusColors';
import { useAuth } from '@/lib/hooks';

const severityHex: Record<string, string> = {
  Info: '#6366F1',
  Warning: '#EA580C',
  Significant: '#DC2626',
  Critical: '#BE185D',
};

const badgeVariantMap: Record<string, string> = {
  blue: 'bg-indigo-50 text-indigo-600',
  orange: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
  magenta: 'bg-pink-50 text-pink-600',
  green: 'bg-emerald-50 text-emerald-600',
  default: 'bg-stone-100 text-stone-600',
};

const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E8E4DD',
  boxShadow: '0 8px 24px -4px rgba(28,25,23,0.1)',
  fontSize: 13,
  fontFamily: 'DM Sans, sans-serif',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stock, isLoading: stockLoading, isError: stockError, error: stockErr, refetch: refetchStock } = useGetStockSummaryQuery();
  const { data: loss, isLoading: lossLoading, isError: lossError, error: lossErr, refetch: refetchLoss } = useGetLossSummaryReportQuery();
  const { data: alertsData, isLoading: alertsLoading, isError: alertsError, error: alertsErr, refetch: refetchAlerts } = useGetAlertsQuery({ page: 1, pageSize: 5, status: 'Open' });
  const { data: transfers, isLoading: transfersLoading, isError: transfersError, error: transfersErr, refetch: refetchTransfers } = useGetTransferReconciliationQuery();

  const allInitialLoading = stockLoading && lossLoading && alertsLoading && transfersLoading;
  if (allInitialLoading) return <DashboardSkeleton />;

  const openAlerts = alertsData?.data ?? [];
  const storesBelow = stock?.stores.filter((s) => s.belowReorderPoint) ?? [];
  const totalShortage = transfers?.transfers.reduce((sum, t) => sum + t.shortageBags, 0) ?? 0;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] text-stone-900 tracking-tight mb-1">
          {greeting}, {user?.firstName ?? 'there'}
        </h2>
        <p className="text-stone-400 text-sm">
          Here&apos;s what&apos;s happening across your facilities today.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="System Stock"
          value={stock?.systemTotalBags ?? 0}
          suffix="bags"
          loading={stockLoading}
          icon={<Database size={20} className="text-indigo-500" />}
          iconColor="#6366F1"
          iconBg="#EEF2FF"
        />
        <KpiCard
          title="Open Alerts"
          value={openAlerts.length}
          loading={alertsLoading}
          icon={<Bell size={20} className="text-rose-500" />}
          iconColor="#F97066"
          iconBg="#FEF3F2"
          trendColor={openAlerts.length > 0 ? '#DC2626' : '#16A34A'}
          trend={openAlerts.length > 0 ? 'up' : 'stable'}
          trendValue={openAlerts.length > 0 ? 'Action required' : 'All clear'}
        />
        <KpiCard
          title="Loss Rate"
          value={loss?.lossRatePct ?? '0'}
          suffix="%"
          loading={lossLoading}
          icon={<TrendingDown size={20} className="text-amber-500" />}
          iconColor="#F59E0B"
          iconBg="#FFFBEB"
          trend={parseFloat(loss?.lossRatePct ?? '0') > 2 ? 'up' : 'stable'}
          trendValue={`${loss?.totalBags ?? 0} bags lost`}
          trendColor={parseFloat(loss?.lossRatePct ?? '0') > 2 ? '#DC2626' : '#16A34A'}
        />
        <KpiCard
          title="Transfer Shortages"
          value={totalShortage}
          suffix="bags"
          loading={transfersLoading}
          icon={<Package size={20} className="text-teal-500" />}
          iconColor="#14B8A6"
          iconBg="#F0FDFA"
          trend={totalShortage > 0 ? 'down' : 'stable'}
          trendValue={totalShortage > 0 ? 'Investigate' : 'No shortages'}
          trendColor={totalShortage > 0 ? '#EA580C' : '#16A34A'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Loss Trend Chart */}
        <div className="rounded-2xl bg-white p-6 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[15px] font-[family-name:var(--font-display)] text-stone-800">
              Monthly Loss Trend
            </h3>
            <Link href="/write-offs/summary" className="text-indigo-500 text-[13px] font-medium hover:text-indigo-600 transition-colors">
              View Report
            </Link>
          </div>
          {lossError && <QueryErrorAlert error={lossErr} />}
          {!lossError && loss?.monthlyTrend && loss.monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={loss.monthlyTrend}>
                <defs>
                  <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97066" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#F97066" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DD" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#A8A095' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="bags" orientation="left" tick={{ fontSize: 12, fill: '#A8A095' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="pct" orientation="right" unit="%" tick={{ fontSize: 12, fill: '#A8A095' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area yAxisId="bags" type="monotone" dataKey="totalBags" stroke="#6366F1" fill="url(#lossGradient)" strokeWidth={2.5} name="Bags Lost" />
                <Area yAxisId="pct" type="monotone" dataKey="lossRatePct" stroke="#F97066" fill="url(#rateGradient)" strokeWidth={2.5} name="Loss Rate %" />
              </AreaChart>
            </ResponsiveContainer>
          ) : !lossError && (
            <p className="text-sm text-stone-400 py-12 text-center">No loss data available</p>
          )}
        </div>

        {/* Stock by Store Bar Chart */}
        <div className="rounded-2xl bg-white p-6 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[15px] font-[family-name:var(--font-display)] text-stone-800">
              Stock Distribution
            </h3>
            <Link href="/reports/stock-summary" className="text-indigo-500 text-[13px] font-medium hover:text-indigo-600 transition-colors">
              View Report
            </Link>
          </div>
          {stockError && <QueryErrorAlert error={stockErr} />}
          {!stockError && stock?.stores && stock.stores.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stock.stores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DD" vertical={false} />
                <XAxis dataKey="storeName" tick={{ fontSize: 11, fill: '#A8A095' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#A8A095' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="totalBags" fill="#6366F1" radius={[6, 6, 0, 0]} name="Total Bags" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : !stockError && (
            <p className="text-sm text-stone-400 py-12 text-center">No stock data available</p>
          )}
        </div>
      </div>

      {/* Bottom row: Alerts + Stores below reorder */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.65fr] gap-4">
        {/* Stock by Store Table */}
        <div className="rounded-2xl bg-white p-6 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[15px] font-[family-name:var(--font-display)] text-stone-800">
              Stock by Store
            </h3>
            <Link href="/reports/stock-summary" className="text-indigo-500 text-[13px] font-medium hover:text-indigo-600 transition-colors">
              View All
            </Link>
          </div>
          {stockError && <QueryErrorAlert error={stockErr} />}
          {!stockError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-stone-400 bg-stone-50/50 rounded-tl-lg">Store</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-stone-400 bg-stone-50/50 w-20">Bags</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-stone-400 bg-stone-50/50 w-24">Weight</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-stone-400 bg-stone-50/50 w-[130px] rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(stock?.stores ?? []).map((s) => (
                    <tr key={s.storeId} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-stone-700">{s.storeName}</td>
                      <td className="py-3 px-3 text-stone-600">{formatNumber(s.totalBags)}</td>
                      <td className="py-3 px-3 text-stone-600">{formatWeight(s.totalWeightKg)}</td>
                      <td className="py-3 px-3">
                        {s.belowReorderPoint ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            Below Reorder
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="rounded-2xl bg-white p-6 border border-stone-100/80 shadow-[var(--k-shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[15px] font-[family-name:var(--font-display)] text-stone-800">
              Recent Alerts
            </h3>
            <Link href="/alerts" className="text-indigo-500 text-[13px] font-medium hover:text-indigo-600 transition-colors">
              View All
            </Link>
          </div>
          {alertsError && <QueryErrorAlert error={alertsErr} />}
          {!alertsError && openAlerts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <CheckCircle size={28} className="text-emerald-400" />
              <span className="text-sm text-stone-500">No open alerts</span>
            </div>
          ) : !alertsError && (
            <div className="divide-y divide-stone-50">
              {openAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${severityHex[alert.severity] ?? '#6366F1'}10` }}
                  >
                    <AlertCircle
                      size={16}
                      style={{ color: severityHex[alert.severity] ?? '#6366F1' }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-stone-700 truncate">
                      {alert.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 h-5 rounded-md ${badgeVariantMap[alertSeverityColors[alert.severity] ?? 'blue'] ?? badgeVariantMap.default}`}
                      >
                        {alert.severity}
                      </Badge>
                      <span className="text-[11px] text-stone-400">{formatDateTime(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
