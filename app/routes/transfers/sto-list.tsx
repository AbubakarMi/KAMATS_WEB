import { useState } from 'react';
import {
  Typography, Card, Space, Select, Modal, Form, Input, InputNumber, DatePicker, message,
} from 'antd';
import { Link } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { usePagination } from '~/shared/hooks';
import { useGetSTOsQuery, useCreateSTOMutation } from '~/features/transfers/stoApi';
import { useGetStoresQuery } from '~/features/admin/adminApi';
import { formatNumber, formatDate } from '~/shared/utils/formatters';
import { sanitizeFormValues, zodValidator, setApiFieldErrors } from '~/shared/utils';
import { createSTOSchema } from '~/shared/schemas';
import { STOStatus } from '~/api/types/enums';
import type { STO } from '~/api/types/distribution';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(STOStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));

export default function STOListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, isError, error: queryError, refetch } = useGetSTOsQuery({
    ...params,
    status: statusFilter as STO['status'] | undefined,
  });
  const { data: stores } = useGetStoresQuery();
  const [createSTO, { isLoading: creating }] = useCreateSTOMutation();

  const stos = data?.data ?? [];
  const pagination = data?.pagination;

  const columns: ColumnsType<STO> = [
    {
      title: 'STO #',
      dataIndex: 'stoNumber',
      width: 140,
      render: (v: string, r: STO) => <Link to={`/transfers/${r.id}`} style={{ color: '#1565C0' }}>{v}</Link>,
    },
    { title: 'Trigger', dataIndex: 'triggerType', width: 130, render: (v: string) => v.replace(/([A-Z])/g, ' $1').trim() },
    { title: 'Source', dataIndex: 'sourceStoreName', ellipsis: true },
    { title: 'Destination', dataIndex: 'destinationStoreName', ellipsis: true },
    { title: 'Bags', dataIndex: 'requestedBags', width: 70, render: (v: number) => formatNumber(v) },
    { title: 'Authorised', dataIndex: 'authorisedBags', width: 90, render: (v: number | null) => v != null ? formatNumber(v) : '—' },
    { title: 'Status', dataIndex: 'status', width: 140, render: (v: string) => <StatusBadge status={v} /> },
    { title: 'Delivery', dataIndex: 'requestedDelivery', width: 110, render: (v: string) => formatDate(v) },
    {
      title: 'TDN',
      dataIndex: 'tdnNumber',
      width: 130,
      render: (v: string | null, r: STO) => v && r.tdnId ? <DocumentLink type="TDN" id={r.tdnId} number={v} /> : '—',
    },
    { title: 'Requested By', dataIndex: 'requestedByName', width: 120, ellipsis: true },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const sanitized = sanitizeFormValues(values);
      await createSTO({
        sourceStoreId: sanitized.sourceStoreId,
        destinationStoreId: sanitized.destinationStoreId,
        requestedBags: sanitized.requestedBags,
        requestedDelivery: sanitized.requestedDelivery.format('YYYY-MM-DD'),
        justification: sanitized.justification,
        notes: sanitized.notes,
      }).unwrap();
      message.success('STO created');
      form.resetFields();
      setModalOpen(false);
    } catch (err) {
      const fallback = setApiFieldErrors(form, err);
      if (fallback) message.error(fallback);
    }
  };

  return (
    <div>
      <Title level={3}>Stock Transfer Orders</Title>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Status"
            allowClear
            options={statusOptions}
            onChange={setStatusFilter}
            style={{ width: 160 }}
          />
        </Space>
        {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
        <DataTable<STO>
          columns={columns}
          dataSource={stos}
          rowKey="id"
          loading={isLoading}
          pagination={pagination}
          onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
          onSortChange={setSort}
          onRefresh={refetch}
          onCreate={() => setModalOpen(true)}
          createLabel="New STO"
          showSearch={false}
          showExport={false}
        />
      </Card>

      <Modal
        title="Create Stock Transfer Order"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        confirmLoading={creating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="sourceStoreId" label="Source Store" rules={[zodValidator(createSTOSchema, 'sourceStoreId')]}>
            <Select placeholder="Select source" options={stores?.map((s) => ({ value: s.id, label: s.name })) ?? []} />
          </Form.Item>
          <Form.Item name="destinationStoreId" label="Destination Store" rules={[zodValidator(createSTOSchema, 'destinationStoreId')]}>
            <Select placeholder="Select destination" options={stores?.map((s) => ({ value: s.id, label: s.name })) ?? []} />
          </Form.Item>
          <Form.Item name="requestedBags" label="Requested Bags" rules={[zodValidator(createSTOSchema, 'requestedBags')]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="requestedDelivery" label="Requested Delivery Date" rules={[{ required: true, message: 'Delivery date is required' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="justification" label="Justification" rules={[zodValidator(createSTOSchema, 'justification')]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
