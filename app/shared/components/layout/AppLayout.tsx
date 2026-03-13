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
    <Layout style={{ minHeight: '100vh', background: '#F0F2F5' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setCollapsed}
        isMobile={isMobile}
        drawerOpen={drawer.open}
        onDrawerClose={drawer.close}
      />
      <Layout
        style={{
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 250),
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          background: '#F0F2F5',
        }}
      >
        <AppHeader isMobile={isMobile} onMenuClick={drawer.toggle} />
        <Content
          style={{
            margin: isMobile ? 12 : 24,
            padding: isMobile ? 16 : 28,
            background: '#fff',
            borderRadius: 14,
            minHeight: 280,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
