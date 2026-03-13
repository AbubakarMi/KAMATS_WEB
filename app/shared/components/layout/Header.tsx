import { Layout, Space, Dropdown, Avatar, Typography, Badge, Button, Select } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SwapOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { useAuth } from '~/shared/hooks';
import { logout, setActiveStore } from '~/store';
import { useLogoutMutation } from '~/features/auth/authApi';

const { Text } = Typography;

interface HeaderProps {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export default function AppHeader({ isMobile, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, storeAssignments, activeStoreId } = useAuth();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('kamats_refresh_token');
    if (refreshToken) {
      try {
        await logoutApi({ refreshToken }).unwrap();
      } catch {
        // Proceed with local logout regardless
      }
    }
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
            {user?.roles?.[0]?.replace(/([A-Z])/g, ' $1').trim() ?? 'User'}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout.Header
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: isMobile ? '0 16px' : '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        height: 60,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 18, color: '#334155' }} />}
            onClick={onMenuClick}
            style={{ width: 40, height: 40 }}
          />
        )}
      </div>

      <Space size={isMobile ? 8 : 16} align="center">
        {/* Store selector (for multi-store users) */}
        {storeAssignments.length > 1 && (
          <Select
            value={activeStoreId ?? undefined}
            onChange={(value) => dispatch(setActiveStore(value))}
            style={{ width: isMobile ? 140 : 200 }}
            size="small"
            suffixIcon={<SwapOutlined />}
            options={storeAssignments.map((s) => ({
              value: s.storeId,
              label: s.storeName,
            }))}
          />
        )}

        {/* Alert bell */}
        <Badge count={0} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18, color: '#64748B' }} />}
            onClick={() => navigate('/alerts')}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Badge>

        {/* User menu */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: '4px 8px 4px 4px',
              borderRadius: 10,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Avatar
              size={34}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                fontWeight: 700,
                fontSize: 13,
                fontFamily: '"Outfit", sans-serif',
              }}
            >
              {initials || <UserOutlined />}
            </Avatar>
            {!isMobile && (
              <div style={{ lineHeight: 1.3 }}>
                <Text
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#1E293B',
                    display: 'block',
                  }}
                >
                  {user?.firstName}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#94A3B8',
                    display: 'block',
                  }}
                >
                  {user?.roles?.[0]?.replace(/([A-Z])/g, ' $1').trim() ?? 'User'}
                </Text>
              </div>
            )}
          </div>
        </Dropdown>
      </Space>
    </Layout.Header>
  );
}
