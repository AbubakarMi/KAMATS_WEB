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
import { useGetPOsQuery } from '@/lib/features/procurement/poApi';
import { useGetSuppliersQuery } from '@/lib/features/suppliers/suppliersApi';
import { formatDate, formatMoney } from '@/lib/utils/formatters';
import { POStatus } from '@/lib/api/types/enums';
import type { PO } from '@/lib/api/types/procurement';

const statusOptions = Object.values(POStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<PO, unknown>[] = [
  {
    accessorKey: 'poNumber',
    header: 'PO Number',
    enableSorting: true,
    cell: ({ row }) => (
      <Link href={`/purchase-orders/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.poNumber}
      </Link>
    ),
  },
  {
    id: 'pr',
    header: 'PR',
    size: 130,
    cell: ({ row }) => (
      <DocumentLink type="PR" id={row.original.prId} number={row.original.prNumber} />
    ),
  },
  { accessorKey: 'supplierName', header: 'Supplier' },
  { accessorKey: 'destinationStoreName', header: 'Store' },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    size: 140,
    enableSorting: true,
    cell: ({ row }) => formatMoney(row.original.totalAmount, row.original.currency),
  },
  {
    accessorKey: 'expectedDeliveryDate',
    header: 'Delivery Date',
    size: 120,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 160,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export default function POListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetPOsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as PO['status']) : undefined,
    supplierId: supplierFilter !== 'all' ? supplierFilter : undefined,
  });

  const { data: suppliersData } = useGetSuppliersQuery({ page: 1, pageSize: 100 });
  const suppliers = suppliersData?.data ?? [];

  const pos = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Purchase Orders
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Supplier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/purchase-orders/create">
              <Plus className="h-4 w-4 mr-1.5" />Create PO
            </Link>
          </Button>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<PO>
        columns={columns}
        data={pos}
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
