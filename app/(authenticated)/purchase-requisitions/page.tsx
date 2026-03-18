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
import { useGetPRsQuery } from '@/lib/features/procurement/prApi';
import { formatDate, formatWeight, formatNumber } from '@/lib/utils/formatters';
import { PRStatus, PRTrigger } from '@/lib/api/types/enums';
import type { PR } from '@/lib/api/types/procurement';

const statusOptions = Object.values(PRStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));
const triggerOptions = Object.values(PRTrigger).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<PR, unknown>[] = [
  {
    accessorKey: 'prNumber',
    header: 'PR Number',
    enableSorting: true,
    cell: ({ row }) => (
      <Link href={`/purchase-requisitions/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.prNumber}
      </Link>
    ),
  },
  {
    accessorKey: 'triggerType',
    header: 'Trigger',
    size: 140,
    cell: ({ getValue }) =>
      (getValue() as string) === 'AutoReorderPoint' ? 'Auto (Reorder)' : 'Manual',
  },
  { accessorKey: 'storeName', header: 'Store' },
  {
    accessorKey: 'requestedQuantity',
    header: 'Qty (bags)',
    size: 100,
    enableSorting: true,
    cell: ({ getValue }) => formatNumber(getValue() as number),
  },
  {
    accessorKey: 'requestedWeightKg',
    header: 'Weight',
    size: 110,
    cell: ({ getValue }) => formatWeight(getValue() as string),
  },
  {
    accessorKey: 'requestedDeliveryDate',
    header: 'Delivery Date',
    size: 120,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 140,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    id: 'linkedPo',
    header: 'Linked PO',
    size: 130,
    cell: ({ row }) =>
      row.original.linkedPoId ? (
        <DocumentLink type="PO" id={row.original.linkedPoId} number={row.original.linkedPoNumber!} />
      ) : '—',
  },
];

export default function PRListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');
  const [triggerFilter, setTriggerFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetPRsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as PR['status']) : undefined,
    triggerType: triggerFilter !== 'all' ? (triggerFilter as PR['triggerType']) : undefined,
  });

  const prs = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Purchase Requisitions
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={triggerFilter} onValueChange={setTriggerFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Trigger" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Triggers</SelectItem>
              {triggerOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/purchase-requisitions/create">
              <Plus className="h-4 w-4 mr-1.5" />Create PR
            </Link>
          </Button>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<PR>
        columns={columns}
        data={prs}
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
