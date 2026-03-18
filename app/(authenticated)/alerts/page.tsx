'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { DataTable } from '@/components/tables/DataTable';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { usePagination } from '@/lib/hooks';
import { useGetAlertsQuery, useAcknowledgeAlertMutation } from '@/lib/features/alerts/alertsApi';
import { formatDateTime } from '@/lib/utils/formatters';
import { sanitizeString } from '@/lib/utils/sanitize';
import { AlertStatus, AlertSeverity } from '@/lib/api/types/enums';
import type { Alert } from '@/lib/api/types/alerts';

const statusOptions = Object.values(AlertStatus).map((s) => ({ value: s, label: s }));
const severityOptions = Object.values(AlertSeverity).map((s) => ({ value: s, label: s }));

export default function AlertsPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [ackAlertId, setAckAlertId] = useState<string | null>(null);
  const [ackNotes, setAckNotes] = useState('');

  const { data, isLoading, isError, error: queryError, refetch } = useGetAlertsQuery({
    ...params,
    status: statusFilter !== 'all' ? (statusFilter as Alert['status']) : undefined,
    severity: severityFilter !== 'all' ? (severityFilter as Alert['severity']) : undefined,
  });
  const [acknowledgeAlert] = useAcknowledgeAlertMutation();

  const handleAcknowledge = async () => {
    if (!ackAlertId) return;
    try {
      await acknowledgeAlert({ id: ackAlertId, body: { acknowledgmentNotes: ackNotes ? sanitizeString(ackNotes) : undefined } }).unwrap();
      toast.success('Alert acknowledged');
      setAckModalOpen(false);
      setAckAlertId(null);
      setAckNotes('');
    } catch {
      toast.error('Failed to acknowledge alert');
    }
  };

  const columns: ColumnDef<Alert, unknown>[] = [
    {
      accessorKey: 'severity',
      header: 'Severity',
      size: 100,
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'storeName', header: 'Store', size: 180 },
    {
      accessorKey: 'alertType',
      header: 'Type',
      size: 160,
      cell: ({ getValue }) => (getValue() as string).replace(/([A-Z])/g, ' $1').trim(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      size: 150,
      cell: ({ getValue }) => formatDateTime(getValue() as string),
    },
    {
      id: 'actions',
      size: 110,
      cell: ({ row }) => row.original.status === 'Open' ? (
        <Button
          size="sm"
          onClick={() => { setAckAlertId(row.original.id); setAckModalOpen(true); }}
        >
          <Check className="h-3.5 w-3.5 mr-1" />Acknowledge
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">Alerts</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {severityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<Alert>
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

      <Dialog open={ackModalOpen} onOpenChange={(open) => { if (!open) { setAckModalOpen(false); setAckAlertId(null); setAckNotes(''); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Acknowledge Alert</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500 mb-2">Optionally provide notes about the action taken.</p>
          <Textarea
            rows={3}
            value={ackNotes}
            onChange={(e) => setAckNotes(e.target.value)}
            placeholder="Acknowledgment notes (optional)..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAckModalOpen(false); setAckAlertId(null); setAckNotes(''); }}>Cancel</Button>
            <Button onClick={handleAcknowledge}>Acknowledge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
