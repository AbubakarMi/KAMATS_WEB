import { useState } from 'react';
import {
  Typography, Button, Space, Modal, Form, Input, Select, message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { StatusBadge } from '~/shared/components/data-display';
import { usePagination } from '~/shared/hooks';
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
} from '~/features/suppliers/suppliersApi';
import { formatPercentage, formatNumber } from '~/shared/utils/formatters';
import { sanitizeFormValues, zodValidator, setApiFieldErrors } from '~/shared/utils';
import { createSupplierSchema } from '~/shared/schemas';
import { SupplierStatus } from '~/api/types/enums';
import type { Supplier, CreateSupplierRequest } from '~/api/types/suppliers';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(SupplierStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));

export default function SuppliersPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, isError, error: queryError, refetch } = useGetSuppliersQuery({
    ...params,
    search: search || undefined,
    status: statusFilter as Supplier['status'] | undefined,
  });

  const [createSupplier, { isLoading: creating }] = useCreateSupplierMutation();

  const suppliers = data?.data ?? [];
  const pagination = data?.pagination;

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const sanitized = sanitizeFormValues(values);
      await createSupplier(sanitized as CreateSupplierRequest).unwrap();
      message.success('Supplier created — pending approval');
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      const fallback = setApiFieldErrors(form, err);
      if (fallback) message.error(fallback);
    }
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Supplier Name',
      dataIndex: 'name',
      sorter: true,
      render: (text: string, record: Supplier) => (
        <Link to={`/suppliers/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Reg #',
      dataIndex: 'registrationNumber',
      width: 120,
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: 'Deliveries',
      dataIndex: 'deliveryCount',
      width: 100,
      sorter: true,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'On-Time %',
      dataIndex: 'onTimeDeliveryRate',
      width: 100,
      sorter: true,
      render: (v: string) => formatPercentage(v),
    },
    {
      title: 'Quality %',
      dataIndex: 'qualityAcceptanceRate',
      width: 100,
      sorter: true,
      render: (v: string) => formatPercentage(v),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Supplier Management</Title>
        <Space wrap>
          <Select
            placeholder="Filter by status"
            allowClear
            options={statusOptions}
            onChange={(v) => setStatusFilter(v)}
            style={{ width: 180 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Create Supplier
          </Button>
        </Space>
      </div>

      {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
      <DataTable<Supplier>
        columns={columns}
        dataSource={suppliers}
        rowKey="id"
        loading={isLoading}
        pagination={pagination}
        onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
        onSortChange={setSort}
        onSearch={setSearch}
        onRefresh={refetch}
        searchPlaceholder="Search suppliers..."
        showExport={false}
      />

      <Modal
        title="Register New Supplier"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        confirmLoading={creating}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="companyName" label="Company Name" rules={[zodValidator(createSupplierSchema, 'companyName')]}>
            <Input />
          </Form.Item>
          <Form.Item name="registrationNumber" label="Registration Number" rules={[zodValidator(createSupplierSchema, 'registrationNumber')]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[zodValidator(createSupplierSchema, 'address')]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="contactPerson" label="Contact Person" rules={[zodValidator(createSupplierSchema, 'contactPerson')]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactPhone" label="Contact Phone" rules={[zodValidator(createSupplierSchema, 'contactPhone')]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactEmail" label="Contact Email" rules={[zodValidator(createSupplierSchema, 'contactEmail')]}>
            <Input />
          </Form.Item>
          <Form.Item name="bankName" label="Bank Name" rules={[zodValidator(createSupplierSchema, 'bankName')]}>
            <Input />
          </Form.Item>
          <Form.Item name="bankAccountNumber" label="Bank Account Number" rules={[zodValidator(createSupplierSchema, 'bankAccountNumber')]}>
            <Input />
          </Form.Item>
          <Form.Item name="bankAccountName" label="Bank Account Name" rules={[zodValidator(createSupplierSchema, 'bankAccountName')]}>
            <Input />
          </Form.Item>
          <Form.Item name="taxId" label="Tax ID" rules={[zodValidator(createSupplierSchema, 'taxId')]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
