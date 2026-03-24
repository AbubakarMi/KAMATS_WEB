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
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { usePagination } from '@/lib/hooks';
import { useGetDispatchListQuery } from '@/lib/features/dispatch/dispatchApi';
import { formatNumber, formatDateTime, formatWeight } from '@/lib/utils/formatters';
import { DispatchStatus } from '@/lib/api/types/enums';
import type { DispatchSession } from '@/lib/api/types/distribution';

const statusOptions = Object.values(DispatchStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<DispatchSession, unknown>[] = [
  {
    accessorKey: 'stoNumber',
    header: 'STO #',
    size: 140,
    cell: ({ row }) => (
      <DocumentLink type="STO" id={row.original.stoId} number={row.original.stoNumber} />
    ),
  },
  {
    id: 'dispatch',
    header: 'Dispatch',
    size: 100,
    cell: ({ row }) => (
      <Link href={`/dispatch/${row.original.id}`} className="text-blue-600 hover:underline font-medium">
        View
      </Link>
    ),
  },
  { accessorKey: 'vehicleReg', header: 'Vehicle', size: 120 },
  { accessorKey: 'driverName', header: 'Driver', size: 140 },
  {
    id: 'progress',
    header: 'Scan Progress',
    size: 140,
    cell: ({ row }) => {
      const { scannedCount, expectedCount } = row.original;
      const pct = expectedCount > 0 ? Math.round((scannedCount / expectedCount) * 100) : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{formatNumber(scannedCount)}/{formatNumber(expectedCount)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'dispatchedWeightKg',
    header: 'Weight',
    size: 110,
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return v ? formatWeight(v) : '—';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 130,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    size: 150,
    cell: ({ getValue }) => formatDateTime(getValue() as string),
  },
];

export default function DispatchListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetDispatchListQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as DispatchSession['status']) : undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Transfer Dispatch
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/dispatch/create">
              <Plus className="h-4 w-4 mr-1.5" />New Dispatch
            </Link>
          </Button>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<DispatchSession>
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
