import { useState, useMemo } from 'react';
import {
  Typography, Button, Space, Modal, Form, Input, Select, Tree, Card,
  Tag, message, Descriptions, Empty,
} from 'antd';
import { PlusOutlined, BankOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import {
  useGetStoresQuery, useCreateStoreMutation, useUpdateStoreMutation,
} from '~/features/admin/adminApi';
import type { Store, CreateStoreRequest } from '~/api/types/admin';
import { StoreTier } from '~/api/types/enums';

const { Title, Text } = Typography;

const tierColors: Record<string, string> = {
  CentralStore: 'blue',
  UnitStore: 'green',
  UserStore: 'orange',
};

export default function StoresPage() {
  const { data: stores, isLoading } = useGetStoresQuery();
  const [createStore, { isLoading: creating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: updating }] = useUpdateStoreMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [form] = Form.useForm();

  // Build tree from flat list
  const treeData = useMemo(() => {
    if (!stores) return [];
    const storeMap = new Map(stores.map((s) => [s.id, s]));
    const roots: DataNode[] = [];

    const toNode = (store: Store): DataNode => ({
      key: store.id,
      title: (
        <Space>
          <BankOutlined />
          <Text strong>{store.code}</Text>
          <Text>{store.name}</Text>
          <Tag color={tierColors[store.tier]}>{store.tier}</Tag>
          {!store.isActive && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
      children: stores
        .filter((s) => s.parentStoreId === store.id)
        .map(toNode),
    });

    stores
      .filter((s) => !s.parentStoreId)
      .forEach((s) => roots.push(toNode(s)));

    return roots;
  }, [stores]);

  const handleSelect = (keys: React.Key[]) => {
    const store = stores?.find((s) => s.id === keys[0]);
    setSelectedStore(store ?? null);
  };

  const openCreateModal = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createStore(values as CreateStoreRequest).unwrap();
      message.success('Store created');
      setModalOpen(false);
    } catch (err) {
      const apiErr = err as { data?: { message?: string } };
      message.error(apiErr?.data?.message || 'Failed to create store');
    }
  };

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Store Hierarchy</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Add Store
        </Button>
      </Space>

      <div style={{ display: 'flex', gap: 24 }}>
        <Card style={{ flex: 1, minWidth: 400 }} loading={isLoading}>
          {treeData.length > 0 ? (
            <Tree
              treeData={treeData}
              defaultExpandAll
              onSelect={handleSelect}
              showLine
            />
          ) : (
            <Empty description="No stores configured" />
          )}
        </Card>

        {selectedStore && (
          <Card title={selectedStore.name} style={{ width: 400 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Code">{selectedStore.code}</Descriptions.Item>
              <Descriptions.Item label="Tier">
                <Tag color={tierColors[selectedStore.tier]}>{selectedStore.tier}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Parent">
                {selectedStore.parentStoreName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {selectedStore.address || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="GPS">
                {selectedStore.gpsLatitude && selectedStore.gpsLongitude
                  ? `${selectedStore.gpsLatitude}, ${selectedStore.gpsLongitude}`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedStore.isActive ? 'green' : 'red'}>
                  {selectedStore.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </div>

      <Modal
        title="Add Store"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        confirmLoading={creating || updating}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Store Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. CS-MAIN, US-CWTP" />
          </Form.Item>
          <Form.Item name="name" label="Store Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tier" label="Tier" rules={[{ required: true }]}>
            <Select
              options={Object.values(StoreTier).map((t) => ({ value: t, label: t }))}
            />
          </Form.Item>
          <Form.Item name="parentStoreId" label="Parent Store">
            <Select
              placeholder="Select parent (required for Unit/User)"
              allowClear
              options={(stores ?? []).map((s) => ({
                value: s.id,
                label: `${s.code} — ${s.name}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
