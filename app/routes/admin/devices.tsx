import { useState } from 'react';
import {
  Typography, Button, Space, Modal, Form, Input, Select,
  Tag, Popconfirm, message,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { DataTable } from '~/shared/components/tables';
import {
  useGetDevicesQuery, useRegisterDeviceMutation, useDeregisterDeviceMutation,
  useGetStoresQuery,
} from '~/features/admin/adminApi';
import { formatDateTime } from '~/shared/utils/formatters';
import type { Device, RegisterDeviceRequest } from '~/api/types/admin';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

export default function DevicesPage() {
  const { data: devices, isLoading, refetch } = useGetDevicesQuery();
  const { data: stores } = useGetStoresQuery();
  const [registerDevice, { isLoading: registering }] = useRegisterDeviceMutation();
  const [deregisterDevice] = useDeregisterDeviceMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      await registerDevice(values as RegisterDeviceRequest).unwrap();
      message.success('Device registered');
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      const apiErr = err as { data?: { message?: string } };
      message.error(apiErr?.data?.message || 'Failed to register device');
    }
  };

  const handleDeregister = async (id: string) => {
    try {
      await deregisterDevice(id).unwrap();
      message.success('Device deregistered');
    } catch {
      message.error('Failed to deregister device');
    }
  };

  const columns: ColumnsType<Device> = [
    { title: 'Device Name', dataIndex: 'deviceName' },
    { title: 'Type', dataIndex: 'deviceType' },
    { title: 'Serial Number', dataIndex: 'serialNumber' },
    { title: 'Store', dataIndex: 'assignedStoreName', render: (v: string | null) => v || '—' },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Registered',
      dataIndex: 'registeredAt',
      render: (v: string) => formatDateTime(v),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Device) => (
        <Popconfirm
          title="Deregister this device? All sessions will be revoked."
          onConfirm={() => handleDeregister(record.id)}
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Device Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Register Device
        </Button>
      </Space>

      <DataTable<Device>
        columns={columns}
        dataSource={devices ?? []}
        rowKey="id"
        loading={isLoading}
        onRefresh={refetch}
        showSearch={false}
        showExport={false}
      />

      <Modal
        title="Register Device"
        open={modalOpen}
        onOk={handleRegister}
        onCancel={() => setModalOpen(false)}
        confirmLoading={registering}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="deviceName" label="Device Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deviceType" label="Device Type" rules={[{ required: true }]}>
            <Select options={[
              { value: 'mobile', label: 'Mobile' },
              { value: 'tablet', label: 'Tablet' },
              { value: 'scanner', label: 'Scanner' },
            ]} />
          </Form.Item>
          <Form.Item name="serialNumber" label="Serial Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="assignedStoreId" label="Assigned Store">
            <Select
              placeholder="Select store"
              allowClear
              options={(stores ?? []).map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
