'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { ColumnDef } from '@tanstack/react-table';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import { KpiCard } from '@/components/charts/KpiCard';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DataTable } from '@/components/tables/DataTable';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { usePagination } from '@/lib/hooks';
import {
  useGetStockBalanceQuery,
  useGetLedgerEntriesQuery,
  useGetBalanceHistoryQuery,
} from '@/lib/features/ledger/ledgerApi';
import { formatNumber, formatWeight, formatDate, formatDateTime } from '@/lib/utils/formatters';
import { LedgerEntryType } from '@/lib/api/types/enums';
import type { LedgerEntry, LotBalance } from '@/lib/api/types/ledger';

const entryTypeOptions = Object.values(LedgerEntryType).map((t) => ({
  value: t, label: t.replace(/([A-Z])/g, ' $1').trim(),
}));

const entryColumns: ColumnDef<LedgerEntry, unknown>[] = [
  { accessorKey: 'entryNumber', header: 'Entry #', size: 90 },
  { accessorKey: 'entryType', header: 'Type', size: 140, cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
  { accessorKey: 'lotNumber', header: 'Lot', size: 130 },
  { accessorKey: 'quantityBags', header: 'Qty', size: 70, cell: ({ getValue }) => formatNumber(getValue() as number) },
  { accessorKey: 'weightKg', header: 'Weight', size: 100, cell: ({ getValue }) => formatWeight(getValue() as string) },
  { accessorKey: 'balanceBefore', header: 'Before', size: 70, cell: ({ getValue }) => formatNumber(getValue() as number) },
  { accessorKey: 'balanceAfter', header: 'After', size: 70, cell: ({ getValue }) => formatNumber(getValue() as number) },
  { accessorKey: 'referenceNumber', header: 'Ref', size: 130 },
  { accessorKey: 'createdAt', header: 'Date', size: 150, cell: ({ getValue }) => formatDateTime(getValue() as string) },
];

export default function LedgerPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [entryTypeFilter, setEntryTypeFilter] = useState('all');
  const [granularity, setGranularity] = useState('daily');

  const { data: balance, isLoading: balanceLoading } = useGetStockBalanceQuery(storeId);
  const { data: entriesData, isLoading: entriesLoading, refetch } = useGetLedgerEntriesQuery({
    storeId,
    params: {
      ...params,
      entryType: entryTypeFilter !== 'all' ? (entryTypeFilter as LedgerEntry['entryType']) : undefined,
    },
  });
  const { data: history } = useGetBalanceHistoryQuery({
    storeId,
    params: { granularity: granularity as 'daily' | 'weekly' | 'monthly' },
  });

  if (balanceLoading) return <DetailPageSkeleton hasKpiCards kpiCount={4} descriptionRows={6} hasTable />;

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-4">
        {balance?.storeName ?? 'Stock Ledger'}
      </h1>

      {balance?.belowReorderPoint && (
        <div className="flex items-start gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-4 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Stock Below Reorder Point</p>
            <p className="text-sm text-amber-700">
              Current stock ({formatNumber(balance.totalBags)} bags) is below the reorder point ({formatNumber(balance.reorderPoint)} bags).
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard title="Total Bags" value={balance?.totalBags ?? 0} loading={balanceLoading} />
        <KpiCard title="Total Weight" value={formatWeight(balance?.totalWeightKg)} loading={balanceLoading} />
        <KpiCard title="Reorder Point" value={balance?.reorderPoint ?? 0} loading={balanceLoading} />
        <KpiCard title="Max Stock" value={balance?.maxStockLevel ?? 0} loading={balanceLoading} />
      </div>

      {balance && balance.balancesByLot.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Lot Balances</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-500 font-medium">Lot</th>
                <th className="text-left py-2 text-slate-500 font-medium">Supplier</th>
                <th className="text-left py-2 text-slate-500 font-medium">Receipt</th>
                <th className="text-right py-2 text-slate-500 font-medium">Total</th>
                <th className="text-right py-2 text-slate-500 font-medium">In Stock</th>
                <th className="text-right py-2 text-slate-500 font-medium">Reserved</th>
                <th className="text-right py-2 text-slate-500 font-medium">In Transit</th>
                <th className="text-right py-2 text-slate-500 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {balance.balancesByLot.map((lot: LotBalance) => (
                <tr key={lot.lotId} className="border-b border-slate-50">
                  <td className="py-2">{lot.lotNumber}</td>
                  <td className="py-2">{lot.supplierName}</td>
                  <td className="py-2">{formatDate(lot.receiptDate)}</td>
                  <td className="text-right py-2">{formatNumber(lot.totalBags)}</td>
                  <td className="text-right py-2">{formatNumber(lot.bagsInStock)}</td>
                  <td className="text-right py-2">{formatNumber(lot.bagsReserved)}</td>
                  <td className="text-right py-2">{formatNumber(lot.bagsInTransit)}</td>
                  <td className="text-right py-2">{formatWeight(lot.weightKg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {history && history.dataPoints.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Balance History</h3>
            <div className="flex gap-1">
              {(['daily', 'weekly', 'monthly'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    granularity === g ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={history.dataPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="balanceBags" name="Balance" stroke="#1e40af" fill="#1e40af" fillOpacity={0.15} />
              <Area type="monotone" dataKey="receipts" name="Receipts" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
              <Area type="monotone" dataKey="consumption" name="Consumption" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Ledger Entries</h3>
          <Select value={entryTypeFilter} onValueChange={setEntryTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Entry type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {entryTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DataTable<LedgerEntry>
          columns={entryColumns}
          data={entriesData?.data ?? []}
          rowKey="id"
          loading={entriesLoading}
          pagination={entriesData?.pagination}
          onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
          onSortChange={setSort}
          onRefresh={refetch}
          showSearch={false}
          showExport={false}
        />
      </div>
    </div>
  );
}
