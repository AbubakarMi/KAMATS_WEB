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
import { useGetStockCountsQuery } from '@/lib/features/stockCount/stockCountApi';
import { formatNumber, formatDate } from '@/lib/utils/formatters';
import { CountStatus, CountType } from '@/lib/api/types/enums';
import type { StockCount } from '@/lib/api/types/stockCount';

const statusOptions = Object.values(CountStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));
const typeOptions = Object.values(CountType).map((t) => ({
  value: t, label: t.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<StockCount, unknown>[] = [
  {
    accessorKey: 'countNumber',
    header: 'Count #',
    size: 140,
    cell: ({ row }) => (
      <Link href={`/stock-counts/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.countNumber}
      </Link>
    ),
  },
  {
    accessorKey: 'countType',
    header: 'Type',
    size: 110,
    cell: ({ getValue }) => (getValue() as string).replace(/([A-Z])/g, ' $1').trim(),
  },
  { accessorKey: 'storeName', header: 'Store' },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 140,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: 'frozenBalance',
    header: 'Frozen Bal.',
    size: 90,
    cell: ({ getValue }) => formatNumber(getValue() as number),
  },
  {
    accessorKey: 'totalVarianceBags',
    header: 'Variance',
    size: 80,
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      return v != null ? formatNumber(v) : '—';
    },
  },
  {
    accessorKey: 'varianceSeverity',
    header: 'Severity',
    size: 100,
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return v ? <StatusBadge status={v} /> : '—';
    },
  },
  { accessorKey: 'assignedToName', header: 'Assigned To' },
  {
    accessorKey: 'scheduledDate',
    header: 'Scheduled',
    size: 110,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
];

export default function StockCountListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetStockCountsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as StockCount['status']) : undefined,
    countType: typeFilter !== 'all' ? (typeFilter as StockCount['countType']) : undefined,
  });

  const counts = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Stock Counts
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Count Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {typeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/stock-counts/create">
              <Plus className="h-4 w-4 mr-1.5" />New Count
            </Link>
          </Button>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<StockCount>
        columns={columns}
        data={counts}
        rowKey="id"
        loading={isLoading}
        pagination={pagination}
        onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
        onSortChange={setSort}
        onRefresh={refetch}
        showSearch={false}
        showExport={false}
      />
    </div>
  );
}
