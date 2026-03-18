'use client';

import { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { DataTable } from '@/components/tables/DataTable';
import { usePagination } from '@/lib/hooks';
import { useGetAuditEventsQuery, useLazyVerifyChainQuery } from '@/lib/features/audit/auditApi';
import { useGetStoresQuery } from '@/lib/features/admin/adminApi';
import { formatDateTime, formatNumber } from '@/lib/utils/formatters';
import type { AuditEvent } from '@/lib/api/types/audit';
import type { StoreChainResult, VerifyChainResponse } from '@/lib/api/types/audit';

const entityTypeOptions = [
  'GRN', 'Lot', 'LedgerEntry', 'STO', 'Dispatch', 'Receipt', 'ConsumptionEntry', 'WriteOff', 'StockCount',
].map((t) => ({ value: t, label: t }));

export default function AuditPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [chainModalOpen, setChainModalOpen] = useState(false);

  const { data, isLoading, refetch } = useGetAuditEventsQuery({
    ...params,
    entityType: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
    storeId: storeFilter !== 'all' ? storeFilter : undefined,
  });
  const { data: stores } = useGetStoresQuery();
  const [triggerVerify, { data: chainResult, isLoading: verifying }] = useLazyVerifyChainQuery();

  const columns: ColumnDef<AuditEvent, unknown>[] = [
    {
      accessorKey: 'eventType',
      header: 'Event Type',
      size: 170,
      cell: ({ getValue }) => (
        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{getValue() as string}</span>
      ),
    },
    { accessorKey: 'entityType', header: 'Entity', size: 120 },
    { accessorKey: 'actorName', header: 'Actor', size: 130 },
    { accessorKey: 'actorRole', header: 'Role', size: 110 },
    {
      id: 'store',
      header: 'Store',
      cell: ({ row }) => stores?.find((s) => s.id === row.original.storeId)?.name ?? row.original.storeId ?? '—',
    },
    { accessorKey: 'ipAddress', header: 'IP', size: 110 },
    { accessorKey: 'storeSequence', header: 'Seq #', size: 70 },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      size: 160,
      cell: ({ getValue }) => formatDateTime(getValue() as string),
    },
  ];

  const handleVerifyChain = async () => {
    try {
      await triggerVerify().unwrap();
      setChainModalOpen(true);
    } catch {
      toast.error('Failed to verify chain');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">Audit Trail</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Entity Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entity Types</SelectItem>
              {entityTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Store" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {(stores ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleVerifyChain} disabled={verifying}>
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            {verifying ? 'Verifying...' : 'Verify Hash Chain'}
          </Button>
        </div>
      </div>

      <DataTable<AuditEvent>
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

      <Dialog open={chainModalOpen} onOpenChange={setChainModalOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader><DialogTitle>Hash Chain Verification</DialogTitle></DialogHeader>
          {chainResult && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-center gap-2 py-3">
                {(chainResult as VerifyChainResponse).overallValid ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                    <span className="text-lg font-semibold text-emerald-600">All Chains Valid</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-500" />
                    <span className="text-lg font-semibold text-red-600">Chain Integrity Broken</span>
                  </>
                )}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-slate-500 font-medium">Store</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Chain Length</th>
                    <th className="text-center py-2 text-slate-500 font-medium">Valid</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Last Seq</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Duration (ms)</th>
                    <th className="text-right py-2 text-slate-500 font-medium">Broken At</th>
                  </tr>
                </thead>
                <tbody>
                  {(chainResult as VerifyChainResponse).results.map((r: StoreChainResult) => (
                    <tr key={r.storeId} className="border-b border-slate-50">
                      <td className="py-2">{r.storeName}</td>
                      <td className="text-right py-2">{formatNumber(r.chainLength)}</td>
                      <td className="text-center py-2">
                        {r.isValid
                          ? <CheckCircle className="h-4 w-4 text-emerald-500 inline" />
                          : <XCircle className="h-4 w-4 text-red-500 inline" />
                        }
                      </td>
                      <td className="text-right py-2">{r.lastSequence}</td>
                      <td className="text-right py-2">{r.verificationDurationMs}</td>
                      <td className="text-right py-2">
                        {r.brokenAtSequence != null ? <span className="text-red-600">#{r.brokenAtSequence}</span> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
