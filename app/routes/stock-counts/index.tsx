import { useState } from 'react';
import {
  Typography, Card, Space, Select, Modal, Form, Input, DatePicker, message,
} from 'antd';
import { Link } from 'react-router';
import { StatusBadge } from '~/shared/components/data-display';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { usePagination } from '~/shared/hooks';
import { useGetStockCountsQuery, useCreateStockCountMutation } from '~/features/stockCount/stockCountApi';
import { useGetStoresQuery } from '~/features/admin/adminApi';
import { formatNumber, formatDate } from '~/shared/utils/formatters';
import { sanitizeFormValues, zodValidator, setApiFieldErrors } from '~/shared/utils';
import { createStockCountSchema } from '~/shared/schemas';
import { CountStatus, CountType } from '~/api/types/enums';
import type { StockCount } from '~/api/types/stockCount';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(CountStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));
const typeOptions = Object.values(CountType).map((t) => ({ value: t, label: t.replace(/([A-Z])/g, ' $1').trim() }));

export default function StockCountListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, isError, error: queryError, refetch } = useGetStockCountsQuery({
    ...params,
    status: statusFilter as StockCount['status'] | undefined,
    countType: typeFilter as StockCount['countType'] | undefined,
  });
  const { data: stores } = useGetStoresQuery();
  const [createCount, { isLoading: creating }] = useCreateStockCountMutation();

  const counts = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnsType<StockCount> = [
    {
      title: 'Count #',
      dataIndex: 'countNumber',
      width: 140,
      render: (v: string, r: StockCount) => <Link to={`/stock-counts/${r.id}`} style={{ color: '#1565C0' }}>{v}</Link>,
    },
    { title: 'Type', dataIndex: 'countType', width: 110, render: (v: string) => v.replace(/([A-Z])/g, ' $1').trim() },
    { title: 'Store', dataIndex: 'storeName', ellipsis: true },
    { title: 'Status', dataIndex: 'status', width: 140, render: (v: string) => <StatusBadge status={v} /> },
    { title: 'Frozen Bal.', dataIndex: 'frozenBalance', width: 90, render: (v: number) => formatNumber(v) },
    { title: 'Variance', dataIndex: 'totalVarianceBags', width: 80, render: (v: number | null) => v != null ? formatNumber(v) : '—' },
    {
      title: 'Severity',
      dataIndex: 'varianceSeverity',
      width: 100,
      render: (v: string | null) => v ? <StatusBadge status={v} /> : '—',
    },
    { title: 'Assigned To', dataIndex: 'assignedToName', ellipsis: true },
    { title: 'Scheduled', dataIndex: 'scheduledDate', width: 110, render: (v: string) => formatDate(v) },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const sanitized = sanitizeFormValues(values);
      await createCount({
        countType: sanitized.countType,
        storeId: sanitized.storeId,
        locationIds: [],
        assignedTo: sanitized.assignedTo,
        scheduledDate: sanitized.scheduledDate.format('YYYY-MM-DD'),
      }).unwrap();
      message.success('Stock count created');
      form.resetFields();
      setModalOpen(false);
    } catch (err) {
      const fallback = setApiFieldErrors(form, err);
      if (fallback) message.error(fallback);
    }
  };

  return (
    <div>
      <Title level={3}>Stock Counts</Title>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Status"
            allowClear
            options={statusOptions}
            onChange={setStatusFilter}
            style={{ width: 160 }}
          />
          <Select
            placeholder="Count Type"
            allowClear
            options={typeOptions}
            onChange={setTypeFilter}
            style={{ width: 150 }}
          />
        </Space>
        {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
        <DataTable<StockCount>
          columns={columns}
          dataSource={counts}
          rowKey="id"
          loading={isLoading}
          pagination={pagination}
          onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
          onSortChange={setSort}
          onRefresh={refetch}
          onCreate={() => setModalOpen(true)}
          createLabel="New Count"
          showSearch={false}
          showExport={false}
        />
      </Card>

      <Modal
        title="Create Stock Count"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        confirmLoading={creating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="countType" label="Count Type" rules={[zodValidator(createStockCountSchema, 'countType')]}>
            <Select options={typeOptions} placeholder="Select type" />
          </Form.Item>
          <Form.Item name="storeId" label="Store" rules={[zodValidator(createStockCountSchema, 'storeId')]}>
            <Select
              placeholder="Select store"
              options={stores?.map((s) => ({ value: s.id, label: s.name })) ?? []}
            />
          </Form.Item>
          <Form.Item name="assignedTo" label="Assigned To (User ID)" rules={[zodValidator(createStockCountSchema, 'assignedTo')]}>
            <Input placeholder="User ID" />
          </Form.Item>
          <Form.Item name="scheduledDate" label="Scheduled Date" rules={[{ required: true, message: 'Scheduled date is required' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
