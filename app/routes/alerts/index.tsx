import { useState } from 'react';
import {
  Typography, Card, Space, Select, Button, Modal, Input, Tag, message,
} from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { StatusBadge } from '~/shared/components/data-display';
import { DataTable } from '~/shared/components/tables';
import { QueryErrorAlert } from '~/shared/components/errors';
import { usePagination } from '~/shared/hooks';
import { useGetAlertsQuery, useAcknowledgeAlertMutation } from '~/features/alerts/alertsApi';
import { formatDateTime } from '~/shared/utils/formatters';
import { sanitizeString } from '~/shared/utils';
import { AlertStatus, AlertSeverity } from '~/api/types/enums';
import { alertSeverityColors } from '~/shared/utils/statusColors';
import type { Alert } from '~/api/types/alerts';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusOptions = Object.values(AlertStatus).map((s) => ({ value: s, label: s }));
const severityOptions = Object.values(AlertSeverity).map((s) => ({ value: s, label: s }));

export default function AlertsPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [severityFilter, setSeverityFilter] = useState<string | undefined>();
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [ackAlertId, setAckAlertId] = useState<string | null>(null);
  const [ackNotes, setAckNotes] = useState('');

  const { data, isLoading, isError, error: queryError, refetch } = useGetAlertsQuery({
    ...params,
    status: statusFilter as Alert['status'] | undefined,
    severity: severityFilter as Alert['severity'] | undefined,
  });
  const [acknowledgeAlert] = useAcknowledgeAlertMutation();

  const alerts = data?.data ?? [];
  const pagination = data?.pagination;

  const handleAcknowledge = async () => {
    if (!ackAlertId) return;
    try {
      await acknowledgeAlert({ id: ackAlertId, body: { acknowledgmentNotes: ackNotes ? sanitizeString(ackNotes) : undefined } }).unwrap();
      message.success('Alert acknowledged');
      setAckModalOpen(false);
      setAckAlertId(null);
      setAckNotes('');
    } catch {
      message.error('Failed to acknowledge alert');
    }
  };

  const columns: ColumnsType<Alert> = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      width: 100,
      render: (v: string) => <Tag color={alertSeverityColors[v]}>{v}</Tag>,
    },
    { title: 'Title', dataIndex: 'title', ellipsis: true },
    { title: 'Store', dataIndex: 'storeName', width: 180, ellipsis: true },
    { title: 'Type', dataIndex: 'alertType', width: 160, render: (v: string) => v.replace(/([A-Z])/g, ' $1').trim() },
    { title: 'Status', dataIndex: 'status', width: 120, render: (v: string) => <StatusBadge status={v} /> },
    { title: 'Created', dataIndex: 'createdAt', width: 150, render: (v: string) => formatDateTime(v) },
    {
      title: '',
      width: 110,
      render: (_: unknown, r: Alert) => r.status === 'Open' ? (
        <Button
          size="small"
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => { setAckAlertId(r.id); setAckModalOpen(true); }}
        >
          Acknowledge
        </Button>
      ) : null,
    },
  ];

  return (
    <div>
      <Title level={3}>Alerts</Title>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select placeholder="Status" allowClear options={statusOptions} onChange={setStatusFilter} style={{ width: 140 }} />
          <Select placeholder="Severity" allowClear options={severityOptions} onChange={setSeverityFilter} style={{ width: 140 }} />
        </Space>
        {isError && <QueryErrorAlert error={queryError} onRetry={refetch} />}
        <DataTable<Alert>
          columns={columns}
          dataSource={alerts}
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

      <Modal
        title="Acknowledge Alert"
        open={ackModalOpen}
        onOk={handleAcknowledge}
        onCancel={() => { setAckModalOpen(false); setAckAlertId(null); setAckNotes(''); }}
        okText="Acknowledge"
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          Optionally provide notes about the action taken.
        </Text>
        <TextArea
          rows={3}
          value={ackNotes}
          onChange={(e) => setAckNotes(e.target.value)}
          placeholder="Acknowledgment notes (optional)..."
        />
      </Modal>
    </div>
  );
}
