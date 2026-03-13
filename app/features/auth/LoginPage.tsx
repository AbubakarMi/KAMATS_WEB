import { useEffect } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from './authApi';
import { setCredentials } from '~/store';
import { useAuth, useBreakpoint } from '~/shared/hooks';
import { sanitizeFormValues, zodValidator } from '~/shared/utils';
import { loginSchema } from '~/shared/schemas';
import type { LoginRequest } from '~/api/types/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [login, { isLoading, error }] = useLoginMutation();
  const { isMobile } = useBreakpoint();

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
        flexDirection: isMobile ? 'column' : 'row',
        background: '#F8FAFC',
      }}
    >
      {/* ── Left Panel: Brand ── */}
      <div
        style={{
          flex: isMobile ? 'none' : '0 0 44%',
          background: 'linear-gradient(135deg, #0B1120 0%, #1E293B 40%, #0F172A 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isMobile ? '48px 24px 40px' : '60px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: isMobile ? 240 : undefined,
        }}
      >
        {/* Background: radial glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(ellipse 600px 400px at 30% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 70%),
              radial-gradient(ellipse 400px 300px at 70% 70%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)
            `,
            pointerEvents: 'none',
          }}
        />
        {/* Background: grid dots */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
          }}
        />

        {/* Brand content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Logo mark */}
          <div
            style={{
              width: isMobile ? 52 : 64,
              height: isMobile ? 52 : 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 32px rgba(37, 99, 235, 0.35)',
            }}
          >
            <span
              style={{
                color: '#fff',
                fontWeight: 800,
                fontSize: isMobile ? 22 : 28,
                fontFamily: '"Outfit", sans-serif',
                lineHeight: 1,
              }}
            >
              K
            </span>
          </div>

          <h1
            style={{
              color: '#F1F5F9',
              fontSize: isMobile ? 28 : 38,
              fontWeight: 800,
              fontFamily: '"Outfit", sans-serif',
              letterSpacing: '-0.02em',
              margin: '0 0 8px',
              lineHeight: 1.1,
            }}
          >
            KAMATS
          </h1>
          <p
            style={{
              color: '#64748B',
              fontSize: isMobile ? 13 : 15,
              fontWeight: 500,
              maxWidth: 300,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Kano Alum Management
            <br />
            & Transparency System
          </p>

          {!isMobile && (
            <div
              style={{
                width: 48,
                height: 3,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                margin: '32px auto 0',
              }}
            />
          )}
        </div>

        {/* Bottom credit */}
        {!isMobile && (
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              color: '#475569',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            Kano State Water Board
          </div>
        )}
      </div>

      {/* ── Right Panel: Form ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '32px 24px 48px' : '48px',
        }}
      >
        <div style={{ maxWidth: 380, width: '100%' }}>
          <h2
            style={{
              fontSize: isMobile ? 22 : 26,
              fontWeight: 700,
              fontFamily: '"Outfit", sans-serif',
              color: '#0F172A',
              margin: '0 0 4px',
              letterSpacing: '-0.01em',
            }}
          >
            Welcome back
          </h2>
          <p
            style={{
              color: '#94A3B8',
              fontSize: 14,
              margin: '0 0 32px',
              fontWeight: 500,
            }}
          >
            Sign in to your account to continue
          </p>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form<LoginRequest>
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="username"
              label={
                <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                  Username
                </span>
              }
              rules={[zodValidator(loginSchema, 'username')]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
                placeholder="Enter your username"
                autoFocus
                style={{ height: 44 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                  Password
                </span>
              }
              rules={[zodValidator(loginSchema, 'password')]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                placeholder="Enter your password"
                style={{ height: 44 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                style={{
                  height: 46,
                  fontWeight: 600,
                  fontSize: 15,
                  fontFamily: '"Outfit", sans-serif',
                  letterSpacing: '0.01em',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {isMobile && (
            <p
              style={{
                textAlign: 'center',
                color: '#94A3B8',
                fontSize: 12,
                marginTop: 32,
                fontWeight: 500,
              }}
            >
              Kano State Water Board
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
