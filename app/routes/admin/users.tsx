import { useState, useCallback } from 'react';
import {
  Typography, Button, Space, Modal, Form, Input, Select,
  Tag, Popconfirm, message, Tooltip,
} from 'antd';
import {
  PlusOutlined, LockOutlined, StopOutlined, UnlockOutlined,
} from '@ant-design/icons';
import { DataTable } from '~/shared/components/tables';
import { usePagination } from '~/shared/hooks';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useUnlockUserMutation,
  useGetStoresQuery,
} from '~/features/admin/adminApi';
import { formatDateTime } from '~/shared/utils/formatters';
import type { User, CreateUserRequest, UpdateUserRequest } from '~/api/types/admin';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

export default function UsersPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useGetUsersQuery({
    ...params,
    search: search || undefined,
  });

  const { data: stores } = useGetStoresQuery();
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [unlockUser] = useUnlockUserMutation();

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      storeId: user.storeId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser({ id: editingUser.id, data: values as UpdateUserRequest }).unwrap();
        message.success('User updated');
      } else {
        await createUser(values as CreateUserRequest).unwrap();
        message.success('User created');
      }
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      const apiErr = err as { data?: { message?: string } };
      message.error(apiErr?.data?.message || 'Operation failed');
    }
  };

  const handleDeactivate = useCallback(async (id: string) => {
    try {
      await deactivateUser(id).unwrap();
      message.success('User deactivated');
    } catch {
      message.error('Failed to deactivate user');
    }
  }, [deactivateUser]);

  const handleUnlock = useCallback(async (id: string) => {
    try {
      await unlockUser(id).unwrap();
      message.success('User unlocked');
    } catch {
      message.error('Failed to unlock user');
    }
  }, [unlockUser]);

  const columns: ColumnsType<User> = [
    {
      title: 'Username',
      dataIndex: 'username',
      sorter: true,
      render: (text: string, record: User) => (
        <a onClick={() => openEditModal(record)}>{text}</a>
      ),
    },
    {
      title: 'Name',
      key: 'name',
      render: (_: unknown, record: User) => `${record.firstName} ${record.lastName}`,
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
    },
    {
      title: 'Store',
      dataIndex: 'storeName',
      render: (text: string | null) => text || '—',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      render: (roles: User['roles']) =>
        roles.map((r) => <Tag key={r.id}>{r.name}</Tag>),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: User) => {
        if (!record.isActive) return <Tag color="red">Inactive</Tag>;
        if (record.lockoutEnd) return <Tag color="orange">Locked</Tag>;
        return <Tag color="green">Active</Tag>;
      },
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      render: (v: string | null) => formatDateTime(v),
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: User) => (
        <Space size="small">
          {record.isActive && (
            <Popconfirm
              title="Deactivate this user?"
              onConfirm={() => handleDeactivate(record.id)}
            >
              <Tooltip title="Deactivate">
                <Button type="text" size="small" danger icon={<StopOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
          {record.lockoutEnd && (
            <Tooltip title="Unlock">
              <Button
                type="text"
                size="small"
                icon={<UnlockOutlined />}
                onClick={() => handleUnlock(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>User Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Create User
        </Button>
      </Space>

      <DataTable<User>
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={isLoading}
        pagination={pagination}
        onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
        onSortChange={setSort}
        onSearch={setSearch}
        onRefresh={refetch}
        searchPlaceholder="Search users..."
        showExport={false}
      />

      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={creating || updating}
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editingUser && (
            <>
              <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}>
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </>
          )}
          <Form.Item name="firstName" label="First Name" rules={[{ required: !editingUser }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: !editingUser }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: !editingUser, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone Number">
            <Input />
          </Form.Item>
          <Form.Item name="storeId" label="Primary Store">
            <Select
              placeholder="Select store"
              allowClear
              options={(stores ?? []).map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }))}
            />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="roleIds" label="Roles" rules={[{ required: true }]}>
              <Select mode="multiple" placeholder="Select roles" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
