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
import { useGetSuppliersQuery } from '@/lib/features/suppliers/suppliersApi';
import { formatPercentage, formatNumber } from '@/lib/utils/formatters';
import { SupplierStatus } from '@/lib/api/types/enums';
import type { Supplier } from '@/lib/api/types/suppliers';

const statusOptions = Object.values(SupplierStatus).map((s) => ({
  value: s,
  label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<Supplier, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Supplier Name',
    enableSorting: true,
    cell: ({ row }) => (
      <Link href={`/suppliers/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: 'registrationNumber', header: 'Reg #', size: 120 },
  { accessorKey: 'contactPerson', header: 'Contact Person' },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 140,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: 'deliveryCount',
    header: 'Deliveries',
    size: 100,
    enableSorting: true,
    cell: ({ getValue }) => formatNumber(getValue() as number),
  },
  {
    accessorKey: 'onTimeDeliveryRate',
    header: 'On-Time %',
    size: 100,
    enableSorting: true,
    cell: ({ getValue }) => formatPercentage(getValue() as string),
  },
  {
    accessorKey: 'qualityAcceptanceRate',
    header: 'Quality %',
    size: 100,
    enableSorting: true,
    cell: ({ getValue }) => formatPercentage(getValue() as string),
  },
];

export default function SuppliersPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetSuppliersQuery({
    ...params,
    search: search || undefined,
    status: statusFilter !== 'all' ? (statusFilter as Supplier['status']) : undefined,
  });

  const suppliers = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Supplier Management
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/suppliers/create">
              <Plus className="h-4 w-4 mr-1.5" />Create Supplier
            </Link>
          </Button>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<Supplier>
        columns={columns}
        data={suppliers}
        rowKey="id"
        loading={isLoading}
        pagination={pagination}
        onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
        onSortChange={setSort}
        onSearch={setSearch}
        onRefresh={refetch}
        searchPlaceholder="Search suppliers..."
        showExport={false}
      />
    </div>
  );
}
