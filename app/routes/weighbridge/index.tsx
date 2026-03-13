import { useState } from 'react';
import { Typography, Select, Tag } from 'antd';
import { Link } from 'react-router';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { usePagination } from '~/shared/hooks';
import { useGetWeighbridgeTicketsQuery } from '~/features/weighbridge/weighbridgeApi';
import { formatWeight, formatPercentage, formatDateTime } from '~/shared/utils/formatters';
import { WeighbridgeStatus } from '~/api/types/enums';
import type { WeighbridgeTicket } from '~/api/types/weighbridge';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(WeighbridgeStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));

export default function WeighbridgeListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, isError, error: queryError, refetch } = useGetWeighbridgeTicketsQuery({
    ...params,
    status: statusFilter as WeighbridgeTicket['status'] | undefined,
  });

  const tickets = data?.data ?? [];
  const pagination = data?.pagination;

  const getVarianceColor = (pct: string | null) => {
    if (!pct) return undefined;
    const n = Math.abs(parseFloat(pct));
    if (n <= 2) return 'green';
    if (n <= 5) return 'orange';
    return 'red';
  };

  const columns: ColumnsType<WeighbridgeTicket> = [
    {
      title: 'Ticket #',
      dataIndex: 'ticketNumber',
      sorter: true,
      render: (text: string, record: WeighbridgeTicket) => (
        <Link to={`/weighbridge/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'PO',
      key: 'po',
      width: 130,
      render: (_: unknown, record: WeighbridgeTicket) => (
        <DocumentLink type="PO" id={record.poId} number={record.poNumber} />
      ),
    },
    {
      title: 'DVR',
      key: 'dvr',
      width: 130,
      render: (_: unknown, record: WeighbridgeTicket) => (
        <DocumentLink type="DVR" id={record.dvrId} number={record.dvrNumber} />
      ),
    },
    { title: 'Supplier', dataIndex: 'supplierName' },
    { title: 'Gross', dataIndex: 'grossWeightKg', width: 100, render: (v: string | null) => formatWeight(v) },
    { title: 'Tare', dataIndex: 'tareWeightKg', width: 100, render: (v: string | null) => formatWeight(v) },
    { title: 'Net', dataIndex: 'netWeightKg', width: 100, render: (v: string | null) => formatWeight(v) },
    {
      title: 'Variance',
      dataIndex: 'variancePct',
      width: 100,
      render: (v: string | null) =>
        v ? <Tag color={getVarianceColor(v)}>{formatPercentage(v)}</Tag> : '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 150,
      render: (status: string) => <StatusBadge status={status} />,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Weighbridge Tickets</Title>
        <Select placeholder="Filter by status" allowClear options={statusOptions} onChange={setStatusFilter} style={{ width: 180 }} />
      </div>

      {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
      <DataTable<WeighbridgeTicket>
        columns={columns}
        dataSource={tickets}
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
