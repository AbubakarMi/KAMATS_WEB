import { useState } from 'react';
import { Typography, Table, Button, Modal, Input, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useGetConfigurationQuery, useUpdateConfigMutation } from '~/features/admin/adminApi';
import { formatDateTime } from '~/shared/utils/formatters';
import { sanitizeString } from '~/shared/utils';
import type { ConfigItem } from '~/api/types/admin';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { TextArea } = Input;

export default function ConfigurationPage() {
  const { data: configs, isLoading } = useGetConfigurationQuery();
  const [updateConfig, { isLoading: updating }] = useUpdateConfigMutation();
  const [editItem, setEditItem] = useState<ConfigItem | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (item: ConfigItem) => {
    setEditItem(item);
    setEditValue(JSON.stringify(item.configValue, null, 2));
  };

  const handleSave = async () => {
    if (!editItem) return;
    try {
      const sanitized = sanitizeString(editValue);
      const parsed = JSON.parse(sanitized);
      await updateConfig({
        key: editItem.configKey,
        data: { configValue: parsed },
      }).unwrap();
      message.success('Configuration updated');
      setEditItem(null);
    } catch (err) {
      if (err instanceof SyntaxError) {
        message.error('Invalid JSON');
      } else {
        message.error('Failed to update configuration');
      }
    }
  };

  const columns: ColumnsType<ConfigItem> = [
    { title: 'Key', dataIndex: 'configKey', width: 250 },
    {
      title: 'Value',
      dataIndex: 'configValue',
      render: (v: unknown) => (
        <code style={{ fontSize: 12 }}>
          {JSON.stringify(v, null, 0)?.substring(0, 100)}
        </code>
      ),
    },
    { title: 'Description', dataIndex: 'description', render: (v: string | null) => v || '—' },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      width: 180,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: unknown, record: ConfigItem) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>System Configuration</Title>

      <Table<ConfigItem>
        columns={columns}
        dataSource={configs ?? []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={`Edit: ${editItem?.configKey}`}
        open={!!editItem}
        onOk={handleSave}
        onCancel={() => setEditItem(null)}
        confirmLoading={updating}
        width={600}
      >
        {editItem?.description && (
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
            {editItem.description}
          </Typography.Text>
        )}
        <TextArea
          rows={10}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
      </Modal>
    </div>
  );
}
