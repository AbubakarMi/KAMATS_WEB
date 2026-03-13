import { useState } from 'react';
import {
  Typography, Card, Table, Tag, Button, Modal, Form, Input, Select, message,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { useGetDosageConfigsQuery, useCreateDosageConfigMutation, useUpdateDosageConfigMutation } from '~/features/dosage/dosageApi';
import { useGetStoresQuery } from '~/features/admin/adminApi';
import { sanitizeFormValues, zodValidator, setApiFieldErrors } from '~/shared/utils';
import { createDosageConfigSchema } from '~/shared/schemas';
import type { DosageConfiguration } from '~/api/types/consumption';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

export default function DosageConfigPage() {
  const { data: configs, isLoading } = useGetDosageConfigsQuery();
  const { data: stores } = useGetStoresQuery();
  const [createConfig, { isLoading: creating }] = useCreateDosageConfigMutation();
  const [updateConfig, { isLoading: updating }] = useUpdateDosageConfigMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<DosageConfiguration> = [
    { title: 'Store', dataIndex: 'storeName' },
    { title: 'Standard Rate (kg/m\u00B3)', dataIndex: 'standardRateKgM3', width: 150 },
    { title: 'Effective Rate', dataIndex: 'effectiveRate', width: 120 },
    {
      title: 'Season',
      dataIndex: 'currentSeason',
      width: 100,
      render: (v: string) => <Tag color={v === 'Dry' ? 'orange' : v === 'Wet' ? 'blue' : 'default'}>{v}</Tag>,
    },
    { title: 'Dry Multiplier', dataIndex: 'drySeasonMultiplier', width: 120 },
    { title: 'Wet Multiplier', dataIndex: 'wetSeasonMultiplier', width: 120 },
    { title: 'Acceptable Variance', dataIndex: 'acceptableVariancePct', width: 150, render: (v: string) => `${v}%` },
    {
      title: 'Analytics',
      width: 90,
      render: (_: unknown, r: DosageConfiguration) => (
        <Link to={`/dosage/analytics/${r.storeId}`} style={{ color: '#1565C0' }}>View</Link>
      ),
    },
    {
      title: '',
      width: 70,
      render: (_: unknown, r: DosageConfiguration) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Edit</Button>
      ),
    },
  ];

  const openEdit = (config: DosageConfiguration) => {
    setEditingId(config.id);
    form.setFieldsValue({
      storeId: config.storeId,
      standardRateKgM3: config.standardRateKgM3,
      acceptableVariancePct: config.acceptableVariancePct,
      normalLowPct: config.normalLowPct,
      normalHighPct: config.normalHighPct,
      elevatedHighPct: config.elevatedHighPct,
      drySeasonMultiplier: config.drySeasonMultiplier,
      wetSeasonMultiplier: config.wetSeasonMultiplier,
      drySeasonStart: config.drySeasonStart,
      drySeasonEnd: config.drySeasonEnd,
      wetSeasonStart: config.wetSeasonStart,
      wetSeasonEnd: config.wetSeasonEnd,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const sanitized = sanitizeFormValues(values);
      if (editingId) {
        await updateConfig({ id: editingId, body: sanitized }).unwrap();
        message.success('Configuration updated');
      } else {
        await createConfig(sanitized).unwrap();
        message.success('Configuration created');
      }
      form.resetFields();
      setEditingId(null);
      setModalOpen(false);
    } catch (err) {
      const fallback = setApiFieldErrors(form, err);
      if (fallback) message.error(fallback);
    }
  };

  // Filter to user-level stores for the dropdown
  const userStores = stores?.filter((s) => s.tier === 'UserStore') ?? [];

  return (
    <div>
      <Title level={3}>Dosage Configuration</Title>
      <Card
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>
            New Configuration
          </Button>
        }
      >
        <Table<DosageConfiguration>
          columns={columns}
          dataSource={configs ?? []}
          rowKey="id"
          loading={isLoading}
          size="small"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Dosage Configuration' : 'Create Dosage Configuration'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setEditingId(null); form.resetFields(); }}
        confirmLoading={creating || updating}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="storeId" label="Store" rules={[zodValidator(createDosageConfigSchema, 'storeId')]}>
            <Select
              placeholder="Select treatment plant"
              disabled={!!editingId}
              options={userStores.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="standardRateKgM3" label="Standard Rate (kg/m\u00B3)" rules={[zodValidator(createDosageConfigSchema, 'standardRateKgPerM3')]}>
            <Input placeholder="e.g. 0.012" />
          </Form.Item>
          <Form.Item name="acceptableVariancePct" label="Acceptable Variance (%)" rules={[zodValidator(createDosageConfigSchema, 'acceptableVariancePct')]}>
            <Input placeholder="e.g. 15" />
          </Form.Item>
          <Form.Item name="normalLowPct" label="Normal Low Threshold (%)" rules={[zodValidator(createDosageConfigSchema, 'thresholdNormalLowPct')]}>
            <Input placeholder="e.g. -10" />
          </Form.Item>
          <Form.Item name="normalHighPct" label="Normal High Threshold (%)" rules={[zodValidator(createDosageConfigSchema, 'thresholdNormalHighPct')]}>
            <Input placeholder="e.g. 10" />
          </Form.Item>
          <Form.Item name="elevatedHighPct" label="Elevated High Threshold (%)" rules={[zodValidator(createDosageConfigSchema, 'thresholdElevatedHighPct')]}>
            <Input placeholder="e.g. 30" />
          </Form.Item>
          <Form.Item name="drySeasonMultiplier" label="Dry Season Multiplier" rules={[zodValidator(createDosageConfigSchema, 'drySeasonMultiplier')]}>
            <Input placeholder="e.g. 1.2" />
          </Form.Item>
          <Form.Item name="wetSeasonMultiplier" label="Wet Season Multiplier" rules={[zodValidator(createDosageConfigSchema, 'wetSeasonMultiplier')]}>
            <Input placeholder="e.g. 0.9" />
          </Form.Item>
          <Form.Item name="drySeasonStart" label="Dry Season Start (MM-DD)" rules={[zodValidator(createDosageConfigSchema, 'drySeasonStart')]}>
            <Input placeholder="e.g. 11-01" />
          </Form.Item>
          <Form.Item name="drySeasonEnd" label="Dry Season End (MM-DD)" rules={[zodValidator(createDosageConfigSchema, 'drySeasonEnd')]}>
            <Input placeholder="e.g. 04-30" />
          </Form.Item>
          <Form.Item name="wetSeasonStart" label="Wet Season Start (MM-DD)" rules={[zodValidator(createDosageConfigSchema, 'wetSeasonStart')]}>
            <Input placeholder="e.g. 05-01" />
          </Form.Item>
          <Form.Item name="wetSeasonEnd" label="Wet Season End (MM-DD)" rules={[zodValidator(createDosageConfigSchema, 'wetSeasonEnd')]}>
            <Input placeholder="e.g. 10-31" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
