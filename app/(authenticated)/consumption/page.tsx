'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import { DataTable } from '@/components/tables/DataTable';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { usePagination } from '@/lib/hooks';
import { useGetConsumptionEntriesQuery } from '@/lib/features/consumption/consumptionApi';
import { formatWeight, formatNumber, formatDateTime } from '@/lib/utils/formatters';
import { ConsumptionStatus, AnomalyLevel } from '@/lib/api/types/enums';
import type { ConsumptionEntry } from '@/lib/api/types/consumption';

const statusOptions = Object.values(ConsumptionStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));
const anomalyOptions = Object.values(AnomalyLevel).map((a) => ({
  value: a, label: a.replace(/([A-Z])/g, ' $1').trim(),
}));

function deviationColor(pct: string | null) {
  if (pct == null) return '';
  const n = Math.abs(parseFloat(pct));
  if (n > 30) return 'text-red-600';
  if (n > 15) return 'text-amber-600';
  return '';
}

const columns: ColumnDef<ConsumptionEntry, unknown>[] = [
  {
    accessorKey: 'consumptionNumber',
    header: 'Entry #',
    size: 140,
    cell: ({ row }) => (
      <Link href={`/consumption/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.consumptionNumber}
      </Link>
    ),
  },
  { accessorKey: 'storeName', header: 'Store' },
  { accessorKey: 'operatorName', header: 'Operator' },
  {
    accessorKey: 'volumeTreatedM3',
    header: 'Volume (m³)',
    size: 100,
    cell: ({ getValue }) => formatNumber(Number(getValue() as string)),
  },
  {
    accessorKey: 'actualQtyKg',
    header: 'Consumed',
    size: 100,
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return v ? formatWeight(v) : '—';
    },
  },
  {
    accessorKey: 'actualQtyBags',
    header: 'Bags',
    size: 60,
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      return v != null ? formatNumber(v) : '—';
    },
  },
  {
    accessorKey: 'deviationPct',
    header: 'Deviation',
    size: 90,
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      if (v == null) return '—';
      const num = parseFloat(v);
      return <span className={deviationColor(v)}>{num > 0 ? '+' : ''}{num.toFixed(1)}%</span>;
    },
  },
  {
    accessorKey: 'anomalyLevel',
    header: 'Anomaly',
    size: 120,
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return v ? <StatusBadge status={v} /> : '—';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: 'recordedAt',
    header: 'Recorded',
    size: 150,
    cell: ({ getValue }) => formatDateTime(getValue() as string),
  },
];

export default function ConsumptionListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');
  const [anomalyFilter, setAnomalyFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetConsumptionEntriesQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as ConsumptionEntry['status']) : undefined,
    anomalyLevel: anomalyFilter !== 'all' ? (anomalyFilter as AnomalyLevel) : undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Consumption Records
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/consumption/create">
              <Plus className="h-4 w-4 mr-1.5" />Record Consumption
            </Link>
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={anomalyFilter} onValueChange={setAnomalyFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Anomaly Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {anomalyOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<ConsumptionEntry>
        columns={columns}
        data={data?.data ?? []}
        rowKey="id"
        loading={isLoading}
        pagination={data?.pagination}
        onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
        onSortChange={setSort}
        onRefresh={refetch}
        showSearch={false}
        showExport={false}
      />
    </div>
  );
}
