import { useState } from 'react';
import {
  Typography, Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker, message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { usePagination } from '~/shared/hooks';
import { useGetPRsQuery, useCreatePRMutation } from '~/features/procurement/prApi';
import { useGetStoresQuery } from '~/features/admin/adminApi';
import { formatDate, formatWeight, formatNumber } from '~/shared/utils/formatters';
import { sanitizeFormValues, zodValidator, setApiFieldErrors } from '~/shared/utils';
import { createPRSchema } from '~/shared/schemas';
import { PRStatus, PRTrigger } from '~/api/types/enums';
import type { PR, CreatePRRequest } from '~/api/types/procurement';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const statusOptions = Object.values(PRStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));
const triggerOptions = Object.values(PRTrigger).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() }));

export default function PRListPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [triggerFilter, setTriggerFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, isError, error: queryError, refetch } = useGetPRsQuery({
    ...params,
    status: statusFilter as PR['status'] | undefined,
    triggerType: triggerFilter as PR['triggerType'] | undefined,
  });

  const { data: stores } = useGetStoresQuery();
  const [createPR, { isLoading: creating }] = useCreatePRMutation();

  const prs = data?.data ?? [];
  const pagination = data?.pagination;

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const sanitized = sanitizeFormValues(values);
      const req: CreatePRRequest = {
        storeId: sanitized.storeId,
        requestedQuantity: sanitized.requestedQuantity,
        requestedWeightKg: String(sanitized.requestedQuantity * 50),
        justification: sanitized.justification,
        requestedDeliveryDate: sanitized.requestedDeliveryDate.format('YYYY-MM-DD'),
      };
      await createPR(req).unwrap();
      message.success('Purchase Requisition created');
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      const fallback = setApiFieldErrors(form, err);
      if (fallback) message.error(fallback);
    }
  };

  const columns: ColumnsType<PR> = [
    {
      title: 'PR Number',
      dataIndex: 'prNumber',
      sorter: true,
      render: (text: string, record: PR) => (
        <Link to={`/purchase-requisitions/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Trigger',
      dataIndex: 'triggerType',
      width: 140,
      render: (v: string) => v === 'AutoReorderPoint' ? 'Auto (Reorder)' : 'Manual',
    },
    {
      title: 'Store',
      dataIndex: 'storeName',
    },
    {
      title: 'Qty (bags)',
      dataIndex: 'requestedQuantity',
      width: 100,
      sorter: true,
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'Weight',
      dataIndex: 'requestedWeightKg',
      width: 110,
      render: (v: string) => formatWeight(v),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'requestedDeliveryDate',
      width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: 'Linked PO',
      key: 'linkedPo',
      width: 130,
      render: (_: unknown, record: PR) =>
        record.linkedPoId ? (
          <DocumentLink type="PO" id={record.linkedPoId} number={record.linkedPoNumber!} />
        ) : '—',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Purchase Requisitions</Title>
        <Space wrap>
          <Select placeholder="Status" allowClear options={statusOptions} onChange={setStatusFilter} style={{ width: 160 }} />
          <Select placeholder="Trigger" allowClear options={triggerOptions} onChange={setTriggerFilter} style={{ width: 160 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Create PR
          </Button>
        </Space>
      </div>

      {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
      <DataTable<PR>
        columns={columns}
        dataSource={prs}
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
        title="Create Purchase Requisition"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        confirmLoading={creating}
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="storeId" label="Destination Store" rules={[zodValidator(createPRSchema, 'storeId')]}>
            <Select
              placeholder="Select store"
              options={(stores ?? []).map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }))}
            />
          </Form.Item>
          <Form.Item name="requestedQuantity" label="Quantity (bags)" rules={[zodValidator(createPRSchema, 'quantityBags')]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="justification" label="Justification" rules={[zodValidator(createPRSchema, 'justification')]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="requestedDeliveryDate" label="Requested Delivery Date" rules={[{ required: true, message: 'Delivery date is required' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
