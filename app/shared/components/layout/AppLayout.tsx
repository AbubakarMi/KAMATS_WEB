import { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import AppHeader from './Header';
import { useBreakpoint, useDrawerMenu } from '~/shared/hooks';

const { Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const drawer = useDrawerMenu();

  const sidebarCollapsed = isMobile ? false : (isTablet ? true : collapsed);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setCollapsed}
        isMobile={isMobile}
        drawerOpen={drawer.open}
        onDrawerClose={drawer.close}
      />
      <Layout
        style={{
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 240),
          transition: 'margin-left 0.2s',
        }}
      >
        <AppHeader isMobile={isMobile} onMenuClick={drawer.toggle} />
        <Content
          style={{
            margin: isMobile ? 12 : 24,
            padding: isMobile ? 16 : 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
