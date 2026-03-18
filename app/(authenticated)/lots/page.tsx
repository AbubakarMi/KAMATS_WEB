'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import { DataTable } from '@/components/tables/DataTable';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { usePagination } from '@/lib/hooks';
import { useGetLotsQuery } from '@/lib/features/inventory/lotsApi';
import { useGetStoresQuery } from '@/lib/features/admin/adminApi';
import { formatNumber, formatDate } from '@/lib/utils/formatters';
import { LotStatus } from '@/lib/api/types/enums';
import type { Lot } from '@/lib/api/types/inventory';

const statusOptions = Object.values(LotStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<Lot, unknown>[] = [
  {
    accessorKey: 'lotNumber',
    header: 'Lot #',
    enableSorting: true,
    cell: ({ row }) => (
      <Link href={`/lots/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.lotNumber}
      </Link>
    ),
  },
  { accessorKey: 'grnNumber', header: 'GRN', size: 130 },
  { accessorKey: 'poNumber', header: 'PO', size: 130 },
  { accessorKey: 'supplierName', header: 'Supplier' },
  { accessorKey: 'storeName', header: 'Store' },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: 'totalBags',
    header: 'Total',
    size: 80,
    enableSorting: true,
    cell: ({ getValue }) => formatNumber(getValue() as number),
  },
  {
    accessorKey: 'bagsInStock',
    header: 'In Stock',
    size: 80,
    cell: ({ getValue }) => formatNumber(getValue() as number),
  },
  {
    accessorKey: 'fifoSequence',
    header: 'FIFO #',
    size: 70,
    enableSorting: true,
  },
  {
    accessorKey: 'receiptDate',
    header: 'Receipt Date',
    size: 120,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
];

export default function LotsListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetLotsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as Lot['status']) : undefined,
    storeId: storeFilter !== 'all' ? storeFilter : undefined,
  });

  const { data: stores } = useGetStoresQuery();
  const lots = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Lot Management
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Store" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {(stores ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<Lot>
        columns={columns}
        data={lots}
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
