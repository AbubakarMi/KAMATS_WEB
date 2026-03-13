import { useState } from 'react';
import { Typography, Select } from 'antd';
import { Link } from 'react-router';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { usePagination } from '~/shared/hooks';
import { useGetDVRsQuery } from '~/features/quality/qualityApi';
import { formatDateTime } from '~/shared/utils/formatters';
import { DVRStatus } from '~/api/types/enums';
import type { DVR } from '~/api/types/quality';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(DVRStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));

export default function DVRListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, isError, error: queryError, refetch } = useGetDVRsQuery({
    ...params,
    status: statusFilter as DVR['status'] | undefined,
  });

  const dvrs = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnsType<DVR> = [
    {
      title: 'DVR #',
      dataIndex: 'dvrNumber',
      sorter: true,
      render: (text: string, record: DVR) => (
        <Link to={`/quality/dvr/${record.id}`}>{text}</Link>
      ),
    },
    { title: 'Driver', dataIndex: 'driverName' },
    { title: 'Vehicle', dataIndex: 'vehicleReg', width: 120 },
    { title: 'Supplier', dataIndex: 'supplierName' },
    {
      title: 'PO',
      key: 'po',
      width: 130,
      render: (_: unknown, record: DVR) =>
        record.poId ? <DocumentLink type="PO" id={record.poId} number={record.poNumber!} /> : '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 150,
      render: (status: string) => <StatusBadge status={status} />,
    },
    { title: 'Gate Officer', dataIndex: 'gateOfficerName' },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 150,
      sorter: true,
      render: (v: string) => formatDateTime(v),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Driver Visit Records</Title>
        <Select placeholder="Filter by status" allowClear options={statusOptions} onChange={setStatusFilter} style={{ width: 180 }} />
      </div>

      {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
      <DataTable<DVR>
        columns={columns}
        dataSource={dvrs}
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
