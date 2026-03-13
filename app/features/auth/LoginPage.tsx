import { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from './authApi';
import { setCredentials } from '~/store';
import { useAuth } from '~/shared/hooks';
import { sanitizeFormValues, zodValidator } from '~/shared/utils';
import { loginSchema } from '~/shared/schemas';
import type { LoginRequest } from '~/api/types/auth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [login, { isLoading, error }] = useLoginMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: LoginRequest) => {
    try {
      const sanitized = sanitizeFormValues(values);
      const result = await login(sanitized).unwrap();
      dispatch(setCredentials(result));
      navigate('/', { replace: true });
    } catch {
      // Error is captured via `error` from the mutation hook
    }
  };

  const apiError = error as { data?: { message?: string; code?: string } } | undefined;
  const errorMessage =
    apiError?.data?.code === 'FORBIDDEN'
      ? 'Account is locked or deactivated. Contact your administrator.'
      : apiError?.data?.message || (error ? 'Login failed. Please try again.' : null);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
      }}
    >
      <Card
        style={{ maxWidth: 400, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        styles={{ body: { padding: 32 } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              KAMATS
            </Title>
            <Text type="secondary">
              Kano Alum Management & Transparency System
            </Text>
          </div>

          {errorMessage && (
            <Alert message={errorMessage} type="error" showIcon />
          )}

          <Form<LoginRequest>
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[zodValidator(loginSchema, 'username')]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[zodValidator(loginSchema, 'password')]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Text
            type="secondary"
            style={{ textAlign: 'center', display: 'block', fontSize: 12 }}
          >
            Kano State Water Board
          </Text>
        </Space>
      </Card>
    </div>
  );
}
