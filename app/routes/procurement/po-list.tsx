import { useState } from 'react';
import {
  Typography, Button, Space, Modal, Select, message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { usePagination } from '~/shared/hooks';
import { useGetPOsQuery, useCreatePOMutation } from '~/features/procurement/poApi';
import { useGetSuppliersQuery } from '~/features/suppliers/suppliersApi';
import { formatDate, formatMoney } from '~/shared/utils/formatters';
import { POStatus } from '~/api/types/enums';
import type { PO } from '~/api/types/procurement';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(POStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));

export default function POListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [supplierFilter, setSupplierFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, error: queryError, refetch } = useGetPOsQuery({
    ...params,
    status: statusFilter as PO['status'] | undefined,
    supplierId: supplierFilter,
  });

  const { data: suppliersData } = useGetSuppliersQuery({ page: 1, pageSize: 100 });
  const suppliers = suppliersData?.data ?? [];

  const pos = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnsType<PO> = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      sorter: true,
      render: (text: string, record: PO) => (
        <Link to={`/purchase-orders/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'PR',
      key: 'pr',
      width: 130,
      render: (_: unknown, record: PO) => (
        <DocumentLink type="PR" id={record.prId} number={record.prNumber} />
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
    },
    {
      title: 'Store',
      dataIndex: 'destinationStoreName',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      width: 140,
      sorter: true,
      render: (v: string, record: PO) => formatMoney(v, record.currency),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'expectedDeliveryDate',
      width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 160,
      render: (status: string) => <StatusBadge status={status} />,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Purchase Orders</Title>
        <Space wrap>
          <Select placeholder="Status" allowClear options={statusOptions} onChange={setStatusFilter} style={{ width: 180 }} />
          <Select
            placeholder="Supplier"
            allowClear
            options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            onChange={setSupplierFilter}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Create PO
          </Button>
        </Space>
      </div>

      {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
      <DataTable<PO>
        columns={columns}
        dataSource={pos}
        rowKey="id"
        loading={isLoading}
        pagination={pagination}
        onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
        onSortChange={setSort}
        onRefresh={refetch}
        showSearch={false}
        showExport={false}
      />

      <Modal
        title="Create Purchase Order"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
      >
        <Typography.Text type="secondary">
          PO creation wizard — select an approved PR, choose a supplier, define PO lines, and submit.
          For now, navigate to an Approved PR and use "Convert to PO".
        </Typography.Text>
      </Modal>
    </div>
  );
}
