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

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: `${user?.firstName} ${user?.lastName}`,
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
        background: '#fff',
        padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        height: 56,
      }}
    >
      <div>
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 18 }} />}
            onClick={onMenuClick}
          />
        )}
      </div>

      <Space size={isMobile ? 'small' : 'middle'}>
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
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            onClick={() => navigate('/alerts')}
          />
        </Badge>

        {/* User menu */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            {!isMobile && <Text>{user?.firstName}</Text>}
          </Space>
        </Dropdown>
      </Space>
    </Layout.Header>
  );
}
