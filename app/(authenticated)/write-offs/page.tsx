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
import { useGetWriteOffsQuery } from '@/lib/features/loss/lossApi';
import { formatWeight, formatNumber, formatDateTime } from '@/lib/utils/formatters';
import { WriteOffStatus, WriteOffCategory } from '@/lib/api/types/enums';
import type { WriteOff } from '@/lib/api/types/loss';

const statusOptions = Object.values(WriteOffStatus).map((s) => ({ value: s, label: s }));
const categoryOptions = Object.values(WriteOffCategory).map((c) => ({
  value: c, label: c.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<WriteOff, unknown>[] = [
  {
    accessorKey: 'requestNumber',
    header: 'Request #',
    size: 140,
    cell: ({ row }) => (
      <Link href={`/write-offs/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.requestNumber}
      </Link>
    ),
  },
  { accessorKey: 'storeName', header: 'Store' },
  {
    accessorKey: 'category',
    header: 'Category',
    size: 150,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  { accessorKey: 'bagsCount', header: 'Bags', size: 60, cell: ({ getValue }) => formatNumber(getValue() as number) },
  { accessorKey: 'weightKg', header: 'Weight', size: 100, cell: ({ getValue }) => formatWeight(getValue() as string) },
  { accessorKey: 'status', header: 'Status', size: 100, cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
  { accessorKey: 'raisedByName', header: 'Raised By', size: 120 },
  { accessorKey: 'raisedAt', header: 'Raised', size: 150, cell: ({ getValue }) => formatDateTime(getValue() as string) },
];

export default function WriteOffListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetWriteOffsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as WriteOff['status']) : undefined,
    category: categoryFilter !== 'all' ? (categoryFilter as WriteOff['category']) : undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Write-Off Requests
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/write-offs/summary" className="text-sm text-blue-600 hover:underline mr-2">
            View Loss Summary
          </Link>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/write-offs/create">
              <Plus className="h-4 w-4 mr-1.5" />New Write-Off
            </Link>
          </Button>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<WriteOff>
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
