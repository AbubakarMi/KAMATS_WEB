import { useState } from 'react';
import { Typography, Space, Select } from 'antd';
import { Link } from 'react-router';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { StatusBadge } from '~/shared/components/data-display';
import { usePagination } from '~/shared/hooks';
import { useGetLotsQuery } from '~/features/inventory/lotsApi';
import { useGetStoresQuery } from '~/features/admin/adminApi';
import { formatNumber, formatDate } from '~/shared/utils/formatters';
import { LotStatus } from '~/api/types/enums';
import type { Lot } from '~/api/types/inventory';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(LotStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));

export default function LotsListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [storeFilter, setStoreFilter] = useState<string | undefined>();

  const { data, isLoading, isError, error: queryError, refetch } = useGetLotsQuery({
    ...params,
    status: statusFilter as Lot['status'] | undefined,
    storeId: storeFilter,
  });

  const { data: stores } = useGetStoresQuery();
  const lots = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnsType<Lot> = [
    {
      title: 'Lot #',
      dataIndex: 'lotNumber',
      sorter: true,
      render: (text: string, record: Lot) => (
        <Link to={`/lots/${record.id}`}>{text}</Link>
      ),
    },
    { title: 'GRN', dataIndex: 'grnNumber', width: 130 },
    { title: 'PO', dataIndex: 'poNumber', width: 130 },
    { title: 'Supplier', dataIndex: 'supplierName' },
    { title: 'Store', dataIndex: 'storeName' },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 150,
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: 'Total',
      dataIndex: 'totalBags',
      width: 80,
      sorter: true,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'In Stock',
      dataIndex: 'bagsInStock',
      width: 80,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'FIFO #',
      dataIndex: 'fifoSequence',
      width: 70,
      sorter: true,
    },
    {
      title: 'Receipt Date',
      dataIndex: 'receiptDate',
      width: 120,
      render: (v: string) => formatDate(v),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Lot Management</Title>
        <Space wrap>
          <Select placeholder="Status" allowClear options={statusOptions} onChange={setStatusFilter} style={{ width: 170 }} />
          <Select
            placeholder="Store"
            allowClear
            options={(stores ?? []).map((s) => ({ value: s.id, label: s.name }))}
            onChange={setStoreFilter}
            style={{ width: 200 }}
          />
        </Space>
      </div>

      {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
      <DataTable<Lot>
        columns={columns}
        dataSource={lots}
        rowKey="id"
        loading={isLoading}
        pagination={pagination}
        onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
        onSortChange={setSort}
        onRefresh={refetch}
        showSearch={false}
        showExport={false}
        rowClassName={(record) => record.status === 'Quarantined' ? 'ant-table-row-quarantined' : ''}
      />

      <style>{`.ant-table-row-quarantined { background-color: #fff1f0 !important; }`}</style>
    </div>
  );
}
