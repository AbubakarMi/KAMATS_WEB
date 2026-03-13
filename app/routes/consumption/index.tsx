import { useState } from 'react';
import {
  Typography, Card, Space, Select, Tag,
} from 'antd';
import { Link } from 'react-router';
import { StatusBadge } from '~/shared/components/data-display';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { usePagination } from '~/shared/hooks';
import { useGetConsumptionEntriesQuery } from '~/features/consumption/consumptionApi';
import { formatWeight, formatNumber, formatDateTime } from '~/shared/utils/formatters';
import { ConsumptionStatus, AnomalyLevel } from '~/api/types/enums';
import { anomalyLevelColors } from '~/shared/utils/statusColors';
import type { ConsumptionEntry } from '~/api/types/consumption';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(ConsumptionStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));
const anomalyOptions = Object.values(AnomalyLevel).map((a) => ({ value: a, label: a.replace(/([A-Z])/g, ' $1').trim() }));

export default function ConsumptionListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [anomalyFilter, setAnomalyFilter] = useState<string | undefined>();

  const { data, isLoading, isError, error: queryError, refetch } = useGetConsumptionEntriesQuery({
    ...params,
    status: statusFilter as ConsumptionEntry['status'] | undefined,
    anomalyLevel: anomalyFilter as ConsumptionEntry['anomalyLevel'] | undefined,
  });

  const entries = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnsType<ConsumptionEntry> = [
    {
      title: 'Entry #',
      dataIndex: 'consumptionNumber',
      width: 140,
      render: (v: string, r: ConsumptionEntry) => <Link to={`/consumption/${r.id}`} style={{ color: '#1565C0' }}>{v}</Link>,
    },
    { title: 'Store', dataIndex: 'storeName', ellipsis: true },
    { title: 'Operator', dataIndex: 'operatorName', ellipsis: true },
    { title: 'Volume (m\u00B3)', dataIndex: 'volumeTreatedM3', width: 100, render: (v: string) => formatNumber(Number(v)) },
    { title: 'Consumed', dataIndex: 'actualQtyKg', width: 100, render: (v: string | null) => v ? formatWeight(v) : '—' },
    { title: 'Bags', dataIndex: 'actualQtyBags', width: 60, render: (v: number | null) => v != null ? formatNumber(v) : '—' },
    {
      title: 'Deviation',
      dataIndex: 'deviationPct',
      width: 90,
      render: (v: string | null) => {
        if (v == null) return '—';
        const num = parseFloat(v);
        const color = Math.abs(num) > 30 ? '#ff4d4f' : Math.abs(num) > 15 ? '#faad14' : undefined;
        return <span style={{ color }}>{num > 0 ? '+' : ''}{num.toFixed(1)}%</span>;
      },
    },
    {
      title: 'Anomaly',
      dataIndex: 'anomalyLevel',
      width: 120,
      render: (v: string | null) => v ? <Tag color={anomalyLevelColors[v]}>{v.replace(/([A-Z])/g, ' $1').trim()}</Tag> : '—',
    },
    { title: 'Status', dataIndex: 'status', width: 150, render: (v: string) => <StatusBadge status={v} /> },
    { title: 'Recorded', dataIndex: 'recordedAt', width: 150, render: (v: string) => formatDateTime(v) },
  ];

  return (
    <div>
      <Title level={3}>Consumption Records</Title>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Status"
            allowClear
            options={statusOptions}
            onChange={setStatusFilter}
            style={{ width: 170 }}
          />
          <Select
            placeholder="Anomaly Level"
            allowClear
            options={anomalyOptions}
            onChange={setAnomalyFilter}
            style={{ width: 160 }}
          />
        </Space>
        {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
        <DataTable<ConsumptionEntry>
          columns={columns}
          dataSource={entries}
          rowKey="id"
          loading={isLoading}
          pagination={pagination}
          onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
          onSortChange={setSort}
          onRefresh={refetch}
          showSearch={false}
          showExport={false}
        />
      </Card>
    </div>
  );
}
