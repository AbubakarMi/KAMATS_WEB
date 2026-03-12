import { Typography, Card, Descriptions, Tag, Space, Button, List } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { useGetUsersQuery } from '~/features/admin/adminApi';
import { formatDateTime } from '~/shared/utils/formatters';

const { Title, Text } = Typography;

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch from list query cache or trigger a fetch
  const { data } = useGetUsersQuery({ page: 1, pageSize: 1 });
  const user = data?.data?.find((u) => u.id === id);

  if (!user) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/users')}>
          Back
        </Button>
        <Card style={{ marginTop: 16 }}>
          <Text type="secondary">User not found or loading...</Text>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/users')}>
          Back
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          {user.firstName} {user.lastName}
        </Title>
      </Space>

      <Card>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user.phoneNumber || '—'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={user.isActive ? 'green' : 'red'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Primary Store">{user.storeName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Last Login">{formatDateTime(user.lastLoginAt)}</Descriptions.Item>
          <Descriptions.Item label="Roles" span={2}>
            {user.roles.map((r) => <Tag key={r.id} color="blue">{r.name}</Tag>)}
          </Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(user.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Login Failures">{user.failedLoginAttempts}</Descriptions.Item>
        </Descriptions>
      </Card>

      {user.storeAssignments.length > 0 && (
        <Card title="Store Assignments" style={{ marginTop: 16 }}>
          <List
            size="small"
            dataSource={user.storeAssignments}
            renderItem={(sa) => (
              <List.Item>
                <Text strong>{sa.storeName}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  Assigned {formatDateTime(sa.assignedAt)}
                </Text>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
}
