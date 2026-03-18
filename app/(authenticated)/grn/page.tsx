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
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { usePagination } from '@/lib/hooks';
import { useGetGRNsQuery } from '@/lib/features/grn/grnApi';
import { formatNumber, formatDateTime } from '@/lib/utils/formatters';
import { GRNStatus } from '@/lib/api/types/enums';
import type { GRN } from '@/lib/api/types/grn';

const statusOptions = Object.values(GRNStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<GRN, unknown>[] = [
  {
    accessorKey: 'grnNumber',
    header: 'GRN #',
    enableSorting: true,
    cell: ({ row }) => (
      <Link href={`/grn/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.grnNumber}
      </Link>
    ),
  },
  {
    id: 'po',
    header: 'PO',
    size: 130,
    cell: ({ row }) => <DocumentLink type="PO" id={row.original.poId} number={row.original.poNumber} />,
  },
  {
    id: 'ticket',
    header: 'Ticket #',
    size: 130,
    cell: ({ row }) => <DocumentLink type="WT" id={row.original.weighbridgeTicketId} number={row.original.ticketNumber} />,
  },
  { accessorKey: 'storeName', header: 'Store' },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    id: 'bags',
    header: 'Accepted / Total',
    size: 130,
    cell: ({ row }) =>
      row.original.bagsAccepted !== null
        ? `${formatNumber(row.original.bagsAccepted)} / ${formatNumber(row.original.bagsOnTruck)}`
        : '—',
  },
  {
    accessorKey: 'bagsDamaged',
    header: 'Damaged',
    size: 90,
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      return v !== null ? formatNumber(v) : '—';
    },
  },
  {
    accessorKey: 'receivedAt',
    header: 'Date',
    size: 150,
    enableSorting: true,
    cell: ({ getValue }) => formatDateTime(getValue() as string),
  },
];

export default function GRNListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetGRNsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as GRN['status']) : undefined,
  });

  const grns = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Goods Received Notes
        </h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<GRN>
        columns={columns}
        data={grns}
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
