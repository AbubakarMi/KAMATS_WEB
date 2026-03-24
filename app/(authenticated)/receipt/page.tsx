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
import { useGetReceiptListQuery } from '@/lib/features/receipt/receiptApi';
import { formatNumber, formatDateTime } from '@/lib/utils/formatters';
import { ReceiptStatus } from '@/lib/api/types/enums';
import type { ReceiptSession } from '@/lib/api/types/distribution';

const statusOptions = Object.values(ReceiptStatus).map((s) => ({
  value: s, label: s.replace(/([A-Z])/g, ' $1').trim(),
}));

const columns: ColumnDef<ReceiptSession, unknown>[] = [
  {
    accessorKey: 'grdNumber',
    header: 'GRD #',
    size: 140,
    cell: ({ row }) => (
      <Link href={`/receipt/${row.original.id}`} className="text-blue-600 hover:underline font-medium">
        {row.original.grdNumber}
      </Link>
    ),
  },
  {
    accessorKey: 'tdnNumber',
    header: 'TDN',
    size: 140,
    cell: ({ row }) => (
      <DocumentLink type="TDN" id={row.original.tdnId} number={row.original.tdnNumber} />
    ),
  },
  {
    accessorKey: 'stoNumber',
    header: 'STO',
    size: 140,
    cell: ({ row }) => (
      <DocumentLink type="STO" id={row.original.stoId} number={row.original.stoNumber} />
    ),
  },
  { accessorKey: 'sourceStoreName', header: 'Source', size: 160 },
  {
    id: 'progress',
    header: 'Scan Progress',
    size: 140,
    cell: ({ row }) => {
      const { scannedCount, expectedBags } = row.original;
      const pct = expectedBags > 0 ? Math.round((scannedCount / expectedBags) * 100) : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{formatNumber(scannedCount)}/{formatNumber(expectedBags)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 130,
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: 'arrivalAt',
    header: 'Arrival',
    size: 150,
    cell: ({ getValue }) => formatDateTime(getValue() as string),
  },
];

export default function ReceiptListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, error: queryError, refetch } = useGetReceiptListQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as ReceiptSession['status']) : undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Transfer Receipt
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/receipt/create">
              <Plus className="h-4 w-4 mr-1.5" />New Receipt
            </Link>
          </Button>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<ReceiptSession>
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
