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
import { useGetSTOsQuery } from '@/lib/features/transfers/stoApi';
import { formatNumber, formatDate } from '@/lib/utils/formatters';
import { STOStatus } from '@/lib/api/types/enums';
import type { STO } from '@/lib/api/types/distribution';

const statusOptions = Object.values(STOStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<STO, unknown>[] = [
  {
    accessorKey: 'stoNumber',
    header: 'STO #',
    size: 140,
    cell: ({ row }) => (
      <Link href={`/transfers/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.stoNumber}
      </Link>
    ),
  },
  {
    accessorKey: 'triggerType',
    header: 'Trigger',
    size: 130,
    cell: ({ getValue }) => (getValue() as string).replace(/([A-Z])/g, ' $1').trim(),
  },
  { accessorKey: 'sourceStoreName', header: 'Source' },
  { accessorKey: 'destinationStoreName', header: 'Destination' },
  { accessorKey: 'requestedBags', header: 'Bags', size: 70, cell: ({ getValue }) => formatNumber(getValue() as number) },
  {
    accessorKey: 'authorisedBags',
    header: 'Authorised',
    size: 90,
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      return v != null ? formatNumber(v) : '—';
    },
  },
  { accessorKey: 'status', header: 'Status', size: 140, cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
  { accessorKey: 'requestedDelivery', header: 'Delivery', size: 110, cell: ({ getValue }) => formatDate(getValue() as string) },
  {
    id: 'tdn',
    header: 'TDN',
    size: 130,
    cell: ({ row }) =>
      row.original.tdnNumber && row.original.tdnId
        ? <DocumentLink type="TDN" id={row.original.tdnId} number={row.original.tdnNumber} />
        : '—',
  },
  { accessorKey: 'requestedByName', header: 'Requested By', size: 120 },
];

export default function STOListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetSTOsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as STO['status']) : undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Stock Transfer Orders
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
            <Link href="/transfers/create">
              <Plus className="h-4 w-4 mr-1.5" />New STO
            </Link>
          </Button>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<STO>
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
