import { useState } from 'react';
import { Typography, Select } from 'antd';
import { Link } from 'react-router';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { usePagination } from '~/shared/hooks';
import { useGetGRNsQuery } from '~/features/grn/grnApi';
import { formatNumber, formatDateTime } from '~/shared/utils/formatters';
import { GRNStatus } from '~/api/types/enums';
import type { GRN } from '~/api/types/grn';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(GRNStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));

export default function GRNListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, isError, error: queryError, refetch } = useGetGRNsQuery({
    ...params,
    status: statusFilter as GRN['status'] | undefined,
  });

  const grns = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnsType<GRN> = [
    {
      title: 'GRN #',
      dataIndex: 'grnNumber',
      sorter: true,
      render: (text: string, record: GRN) => (
        <Link to={`/grn/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'PO',
      key: 'po',
      width: 130,
      render: (_: unknown, record: GRN) => (
        <DocumentLink type="PO" id={record.poId} number={record.poNumber} />
      ),
    },
    {
      title: 'Ticket #',
      key: 'ticket',
      width: 130,
      render: (_: unknown, record: GRN) => (
        <DocumentLink type="WT" id={record.weighbridgeTicketId} number={record.ticketNumber} />
      ),
    },
    { title: 'Store', dataIndex: 'storeName' },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 150,
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: 'Accepted / Total',
      key: 'bags',
      width: 130,
      render: (_: unknown, record: GRN) =>
        record.bagsAccepted !== null ? `${formatNumber(record.bagsAccepted)} / ${formatNumber(record.bagsOnTruck)}` : '—',
    },
    {
      title: 'Damaged',
      dataIndex: 'bagsDamaged',
      width: 90,
      render: (v: number | null) => v !== null ? formatNumber(v) : '—',
    },
    {
      title: 'Date',
      dataIndex: 'receivedAt',
      width: 150,
      sorter: true,
      render: (v: string) => formatDateTime(v),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Goods Received Notes</Title>
        <Select placeholder="Filter by status" allowClear options={statusOptions} onChange={setStatusFilter} style={{ width: 180 }} />
      </div>

      {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
      <DataTable<GRN>
        columns={columns}
        dataSource={grns}
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
