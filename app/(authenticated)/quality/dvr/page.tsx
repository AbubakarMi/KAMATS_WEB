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
import { useGetDVRsQuery } from '@/lib/features/quality/qualityApi';
import { formatDateTime } from '@/lib/utils/formatters';
import { DVRStatus } from '@/lib/api/types/enums';
import type { DVR } from '@/lib/api/types/quality';

const statusOptions = Object.values(DVRStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<DVR, unknown>[] = [
  {
    accessorKey: 'dvrNumber',
    header: 'DVR #',
    enableSorting: true,
    cell: ({ row }) => (
      <Link href={`/quality/dvr/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.original.dvrNumber}
      </Link>
    ),
  },
  { accessorKey: 'driverName', header: 'Driver' },
  { accessorKey: 'vehicleReg', header: 'Vehicle', size: 120 },
  { accessorKey: 'supplierName', header: 'Supplier' },
  {
    id: 'po',
    header: 'PO',
    size: 130,
    cell: ({ row }) =>
      row.original.poId ? <DocumentLink type="PO" id={row.original.poId} number={row.original.poNumber!} /> : '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  { accessorKey: 'gateOfficerName', header: 'Gate Officer' },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    size: 150,
    enableSorting: true,
    cell: ({ getValue }) => formatDateTime(getValue() as string),
  },
];

export default function DVRListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetDVRsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as DVR['status']) : undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Driver Visit Records
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

      <DataTable<DVR>
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
