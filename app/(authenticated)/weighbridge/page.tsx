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
import { LiveIndicator } from '@/components/realtime/LiveIndicator';
import { usePagination, useWeighbridgeHub } from '@/lib/hooks';
import { useGetWeighbridgeTicketsQuery } from '@/lib/features/weighbridge/weighbridgeApi';
import { formatWeight, formatPercentage, formatDateTime } from '@/lib/utils/formatters';
import { WeighbridgeStatus } from '@/lib/api/types/enums';
import type { WeighbridgeTicket } from '@/lib/api/types/weighbridge';

const statusOptions = Object.values(WeighbridgeStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

function varianceColorClass(pct: string | null) {
  if (!pct) return '';
  const n = Math.abs(parseFloat(pct));
  if (n <= 2) return 'text-emerald-600';
  if (n <= 5) return 'text-amber-600';
  return 'text-red-600';
}

const columns: ColumnDef<WeighbridgeTicket, unknown>[] = [
  {
    accessorKey: 'ticketNumber',
    header: 'Ticket #',
    enableSorting: true,
    cell: ({ row }) => (
      <Link href={`/weighbridge/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.ticketNumber}
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
    id: 'dvr',
    header: 'DVR',
    size: 130,
    cell: ({ row }) => <DocumentLink type="DVR" id={row.original.dvrId} number={row.original.dvrNumber} />,
  },
  { accessorKey: 'supplierName', header: 'Supplier' },
  { accessorKey: 'grossWeightKg', header: 'Gross', size: 100, cell: ({ getValue }) => formatWeight(getValue() as string | null) },
  { accessorKey: 'tareWeightKg', header: 'Tare', size: 100, cell: ({ getValue }) => formatWeight(getValue() as string | null) },
  { accessorKey: 'netWeightKg', header: 'Net', size: 100, cell: ({ getValue }) => formatWeight(getValue() as string | null) },
  {
    accessorKey: 'variancePct',
    header: 'Variance',
    size: 100,
    cell: ({ getValue }) => {
      const v = getValue() as string | null;
      return v ? <span className={varianceColorClass(v)}>{formatPercentage(v)}</span> : '—';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export default function WeighbridgeListPage() {
  const { connected } = useWeighbridgeHub();
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetWeighbridgeTicketsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as WeighbridgeTicket['status']) : undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            Weighbridge Tickets
          </h1>
          <LiveIndicator connected={connected} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<WeighbridgeTicket>
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
