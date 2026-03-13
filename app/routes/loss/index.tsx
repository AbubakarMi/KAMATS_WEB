import { useState } from 'react';
import {
  Typography, Card, Space, Select, Modal, Form, Input, InputNumber, message,
} from 'antd';
import { Link } from 'react-router';
import { StatusBadge } from '~/shared/components/data-display';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { usePagination } from '~/shared/hooks';
import { useGetWriteOffsQuery, useCreateWriteOffMutation } from '~/features/loss/lossApi';
import { useGetStoresQuery } from '~/features/admin/adminApi';
import { formatWeight, formatNumber, formatDateTime } from '~/shared/utils/formatters';
import { sanitizeFormValues, zodValidator, setApiFieldErrors } from '~/shared/utils';
import { createWriteOffSchema } from '~/shared/schemas';
import { WriteOffStatus, WriteOffCategory } from '~/api/types/enums';
import type { WriteOff } from '~/api/types/loss';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { TextArea } = Input;

const statusOptions = Object.values(WriteOffStatus).map((s) => ({ value: s, label: s }));
const categoryOptions = Object.values(WriteOffCategory).map((c) => ({ value: c, label: c.replace(/([A-Z])/g, ' $1').trim() }));

export default function WriteOffListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, isError, error: queryError, refetch } = useGetWriteOffsQuery({
    ...params,
    status: statusFilter as WriteOff['status'] | undefined,
    category: categoryFilter as WriteOff['category'] | undefined,
  });
  const { data: stores } = useGetStoresQuery();
  const [createWriteOff, { isLoading: creating }] = useCreateWriteOffMutation();

  const writeOffs = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnsType<WriteOff> = [
    {
      title: 'Request #',
      dataIndex: 'requestNumber',
      width: 140,
      render: (v: string, r: WriteOff) => <Link to={`/write-offs/${r.id}`} style={{ color: '#1565C0' }}>{v}</Link>,
    },
    { title: 'Store', dataIndex: 'storeName', ellipsis: true },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 150,
      render: (v: string) => <StatusBadge status={v} />,
    },
    { title: 'Bags', dataIndex: 'bagsCount', width: 60, render: (v: number) => formatNumber(v) },
    { title: 'Weight', dataIndex: 'weightKg', width: 100, render: (v: string) => formatWeight(v) },
    { title: 'Status', dataIndex: 'status', width: 100, render: (v: string) => <StatusBadge status={v} /> },
    { title: 'Raised By', dataIndex: 'raisedByName', width: 120, ellipsis: true },
    { title: 'Raised', dataIndex: 'raisedAt', width: 150, render: (v: string) => formatDateTime(v) },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const sanitized = sanitizeFormValues(values);
      await createWriteOff({
        storeId: sanitized.storeId,
        category: sanitized.category,
        bagsCount: sanitized.bagsCount,
        weightKg: String(sanitized.bagsCount * 50),
        description: sanitized.description,
        itemIds: [],
        lotId: sanitized.lotId || 'lot-001',
      }).unwrap();
      message.success('Write-off request created');
      form.resetFields();
      setModalOpen(false);
    } catch (err) {
      const fallback = setApiFieldErrors(form, err);
      if (fallback) message.error(fallback);
    }
  };

  return (
    <div>
      <Title level={3}>Write-Off Requests</Title>
      <Card
        extra={
          <Link to="/write-offs/summary" style={{ color: '#1565C0' }}>View Loss Summary</Link>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Select placeholder="Status" allowClear options={statusOptions} onChange={setStatusFilter} style={{ width: 130 }} />
          <Select placeholder="Category" allowClear options={categoryOptions} onChange={setCategoryFilter} style={{ width: 170 }} />
        </Space>
        {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
        <DataTable<WriteOff>
          columns={columns}
          dataSource={writeOffs}
          rowKey="id"
          loading={isLoading}
          pagination={pagination}
          onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
          onSortChange={setSort}
          onRefresh={refetch}
          onCreate={() => setModalOpen(true)}
          createLabel="New Write-Off"
          showSearch={false}
          showExport={false}
        />
      </Card>

      <Modal
        title="Create Write-Off Request"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        confirmLoading={creating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="storeId" label="Store" rules={[zodValidator(createWriteOffSchema, 'storeId')]}>
            <Select placeholder="Select store" options={stores?.map((s) => ({ value: s.id, label: s.name })) ?? []} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[zodValidator(createWriteOffSchema, 'category')]}>
            <Select placeholder="Select category" options={categoryOptions} />
          </Form.Item>
          <Form.Item name="bagsCount" label="Number of Bags" rules={[zodValidator(createWriteOffSchema, 'bags')]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lotId" label="Lot ID">
            <Input placeholder="Lot ID (optional)" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[zodValidator(createWriteOffSchema, 'description')]}>
            <TextArea rows={3} placeholder="Describe the reason for write-off..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
