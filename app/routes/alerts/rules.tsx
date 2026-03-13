import { useState } from 'react';
import {
  Typography, Card, Table, Button, Modal, Form, Input, Select, Switch, Tag, message,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import {
  useGetAlertRulesQuery,
  useCreateAlertRuleMutation,
  useUpdateAlertRuleMutation,
} from '~/features/alerts/alertsApi';
import { sanitizeFormValues, zodValidator, setApiFieldErrors } from '~/shared/utils';
import { createAlertRuleSchema } from '~/shared/schemas';
import { AlertSeverity, NotificationChannel } from '~/api/types/enums';
import { alertSeverityColors } from '~/shared/utils/statusColors';
import type { AlertRule } from '~/api/types/alerts';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const severityOptions = Object.values(AlertSeverity).map((s) => ({ value: s, label: s }));
const channelOptions = Object.values(NotificationChannel).map((c) => ({ value: c, label: c }));

export default function AlertRulesPage() {
  const { data: rules, isLoading } = useGetAlertRulesQuery();
  const [createRule, { isLoading: creating }] = useCreateAlertRuleMutation();
  const [updateRule, { isLoading: updating }] = useUpdateAlertRuleMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<AlertRule> = [
    { title: 'Rule Name', dataIndex: 'ruleName' },
    { title: 'Module', dataIndex: 'module', width: 120 },
    { title: 'Condition', dataIndex: 'conditionType', width: 160, render: (v: string) => v.replace(/([A-Z])/g, ' $1').trim() },
    { title: 'Threshold', dataIndex: 'thresholdValue', width: 90 },
    {
      title: 'Severity',
      dataIndex: 'severity',
      width: 100,
      render: (v: string) => <Tag color={alertSeverityColors[v]}>{v}</Tag>,
    },
    {
      title: 'Channels',
      dataIndex: 'channels',
      width: 150,
      render: (v: string[]) => v.map((c) => <Tag key={c}>{c}</Tag>),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      width: 70,
      render: (v: boolean, r: AlertRule) => (
        <Switch
          size="small"
          checked={v}
          onChange={(checked) => updateRule({ id: r.id, body: { isActive: checked } })}
        />
      ),
    },
    {
      title: '',
      width: 70,
      render: (_: unknown, r: AlertRule) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Edit</Button>
      ),
    },
  ];

  const openEdit = (rule: AlertRule) => {
    setEditingId(rule.id);
    form.setFieldsValue({
      ruleName: rule.ruleName,
      module: rule.module,
      conditionType: rule.conditionType,
      thresholdValue: rule.thresholdValue,
      severity: rule.severity,
      notifyRoles: rule.notifyRoles.join(', '),
      channels: rule.channels,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const sanitized = sanitizeFormValues(values);
      const payload = {
        ...sanitized,
        notifyRoles: sanitized.notifyRoles.split(',').map((r: string) => r.trim()).filter(Boolean),
      };
      if (editingId) {
        await updateRule({ id: editingId, body: payload }).unwrap();
        message.success('Rule updated');
      } else {
        await createRule(payload).unwrap();
        message.success('Rule created');
      }
      form.resetFields();
      setEditingId(null);
      setModalOpen(false);
    } catch (err) {
      const fallback = setApiFieldErrors(form, err);
      if (fallback) message.error(fallback);
    }
  };

  return (
    <div>
      <Title level={3}>Alert Rules</Title>
      <Card
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>
            New Rule
          </Button>
        }
      >
        <Table<AlertRule>
          columns={columns}
          dataSource={rules ?? []}
          rowKey="id"
          loading={isLoading}
          size="small"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Alert Rule' : 'Create Alert Rule'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setEditingId(null); form.resetFields(); }}
        confirmLoading={creating || updating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ruleName" label="Rule Name" rules={[zodValidator(createAlertRuleSchema, 'ruleName')]}>
            <Input />
          </Form.Item>
          <Form.Item name="module" label="Module" rules={[zodValidator(createAlertRuleSchema, 'module')]}>
            <Input placeholder="e.g. Ledger, Consumption, StockCount" />
          </Form.Item>
          <Form.Item name="conditionType" label="Condition Type" rules={[zodValidator(createAlertRuleSchema, 'conditionType')]}>
            <Input placeholder="e.g. StockBelowReorder" />
          </Form.Item>
          <Form.Item name="thresholdValue" label="Threshold Value" rules={[zodValidator(createAlertRuleSchema, 'thresholdValue')]}>
            <Input placeholder="e.g. 5" />
          </Form.Item>
          <Form.Item name="severity" label="Severity" rules={[zodValidator(createAlertRuleSchema, 'severity')]}>
            <Select options={severityOptions} />
          </Form.Item>
          <Form.Item name="notifyRoles" label="Notify Roles (comma-separated)" rules={[{ required: true, message: 'At least one role is required' }]}>
            <Input placeholder="e.g. StoreManager, Director" />
          </Form.Item>
          <Form.Item name="channels" label="Notification Channels" rules={[zodValidator(createAlertRuleSchema, 'channels')]}>
            <Select mode="multiple" options={channelOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
