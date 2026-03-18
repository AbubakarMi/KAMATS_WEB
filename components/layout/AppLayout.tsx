'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import AppHeader from './Header';
import { useBreakpoint, useDrawerMenu } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const drawer = useDrawerMenu();

  const sidebarCollapsed = isMobile ? false : (isTablet ? true : collapsed);

  return (
    <div className="min-h-screen bg-[var(--k-bg-page)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setCollapsed}
        isMobile={isMobile}
        drawerOpen={drawer.open}
        onDrawerClose={drawer.close}
      />
      <div
        className={cn(
          'transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]',
        )}
      >
        <AppHeader isMobile={isMobile} onMenuClick={drawer.toggle} />
        <main className={cn(
          isMobile ? 'px-4 pb-6' : 'px-7 pb-8',
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
