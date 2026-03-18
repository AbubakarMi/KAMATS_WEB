'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Store, FileText, ShoppingCart, FlaskConical,
  Gauge, Inbox, Database, ArrowLeftRight, BarChart3, Bell,
  ShieldCheck, Settings, Building2, Calculator, AlertTriangle,
  LayoutGrid, ChevronDown, LogOut,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks';
import { Permissions } from '@/lib/utils/permissions';
import { logout } from '@/lib/store';
import { useLogoutMutation } from '@/lib/features/auth/authApi';

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile?: boolean;
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}

export default function Sidebar({ collapsed, onCollapse, isMobile, drawerOpen, onDrawerClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { hasPermission } = useAuth();
  const [logoutApi] = useLogoutMutation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [];

    items.push({ key: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' });

    // Procurement
    const procurementChildren: MenuItem[] = [];
    if (hasPermission([Permissions.SUPPLIERS_CREATE, Permissions.SUPPLIERS_READ, Permissions.SUPPLIERS_APPROVE])) {
      procurementChildren.push({ key: '/suppliers', icon: <Store size={18} />, label: 'Suppliers' });
    }
    if (hasPermission([Permissions.PR_CREATE, Permissions.PR_READ, Permissions.PR_APPROVE])) {
      procurementChildren.push({ key: '/purchase-requisitions', icon: <FileText size={18} />, label: 'Requisitions' });
    }
    if (hasPermission([Permissions.PO_CREATE, Permissions.PO_READ, Permissions.PO_APPROVE_MANAGER, Permissions.PO_APPROVE_FINANCE])) {
      procurementChildren.push({ key: '/purchase-orders', icon: <ShoppingCart size={18} />, label: 'Purchase Orders' });
    }
    if (procurementChildren.length > 0) {
      items.push({ key: 'procurement', icon: <ShoppingCart size={20} />, label: 'Procurement', children: procurementChildren });
    }

    // Receiving
    const receivingChildren: MenuItem[] = [];
    if (hasPermission([Permissions.DVR_CREATE, Permissions.DVR_READ, Permissions.INSPECTION_READ])) {
      receivingChildren.push({ key: '/quality/dvr', icon: <FlaskConical size={18} />, label: 'Quality / DVR' });
    }
    if (hasPermission([Permissions.WEIGHBRIDGE_RECORD, Permissions.WEIGHBRIDGE_READ, Permissions.WEIGHBRIDGE_OVERRIDE])) {
      receivingChildren.push({ key: '/weighbridge', icon: <Gauge size={18} />, label: 'Weighbridge' });
    }
    if (hasPermission([Permissions.GRN_CREATE, Permissions.GRN_READ])) {
      receivingChildren.push({ key: '/grn', icon: <Inbox size={18} />, label: 'GRN' });
    }
    if (receivingChildren.length > 0) {
      items.push({ key: 'receiving', icon: <Inbox size={20} />, label: 'Receiving', children: receivingChildren });
    }

    // Inventory
    const inventoryChildren: MenuItem[] = [];
    if (hasPermission([Permissions.LOTS_READ, Permissions.ITEMS_READ])) {
      inventoryChildren.push({ key: '/lots', icon: <LayoutGrid size={18} />, label: 'Lots & Items' });
    }
    if (hasPermission([Permissions.LOCATIONS_READ, Permissions.LOCATIONS_MANAGE])) {
      inventoryChildren.push({ key: '/warehouse/default', icon: <Building2 size={18} />, label: 'Warehouse' });
    }
    if (hasPermission(Permissions.LEDGER_READ)) {
      inventoryChildren.push({ key: '/ledger/default', icon: <Database size={18} />, label: 'Stock Ledger' });
    }
    if (hasPermission([Permissions.STOCKCOUNT_CREATE, Permissions.STOCKCOUNT_READ, Permissions.STOCKCOUNT_EXECUTE, Permissions.STOCKCOUNT_APPROVE])) {
      inventoryChildren.push({ key: '/stock-counts', icon: <Calculator size={18} />, label: 'Stock Count' });
    }
    if (inventoryChildren.length > 0) {
      items.push({ key: 'inventory', icon: <Database size={20} />, label: 'Inventory', children: inventoryChildren });
    }

    // Distribution
    const distributionChildren: MenuItem[] = [];
    if (hasPermission([Permissions.STO_CREATE, Permissions.STO_READ, Permissions.STO_APPROVE_CENTRAL_UNIT, Permissions.STO_APPROVE_UNIT_USER])) {
      distributionChildren.push({ key: '/transfers', icon: <ArrowLeftRight size={18} />, label: 'Transfers' });
    }
    if (distributionChildren.length > 0) {
      items.push({ key: 'distribution', icon: <ArrowLeftRight size={20} />, label: 'Distribution', children: distributionChildren });
    }

    // Consumption
    const consumptionChildren: MenuItem[] = [];
    if (hasPermission([Permissions.CONSUMPTION_RECORD, Permissions.CONSUMPTION_READ, Permissions.CONSUMPTION_ACKNOWLEDGE])) {
      consumptionChildren.push({ key: '/consumption', icon: <BarChart3 size={18} />, label: 'Consumption' });
    }
    if (hasPermission([Permissions.DOSAGE_READ, Permissions.DOSAGE_CONFIGURE])) {
      consumptionChildren.push({ key: '/dosage', icon: <FlaskConical size={18} />, label: 'Dosage Config' });
    }
    if (hasPermission([Permissions.WRITEOFF_RAISE, Permissions.WRITEOFF_READ, Permissions.WRITEOFF_APPROVE_MINOR, Permissions.WRITEOFF_APPROVE_SIGNIFICANT, Permissions.WRITEOFF_APPROVE_CRITICAL])) {
      consumptionChildren.push({ key: '/write-offs', icon: <AlertTriangle size={18} />, label: 'Write-Offs' });
    }
    if (consumptionChildren.length > 0) {
      items.push({ key: 'consumption-group', icon: <BarChart3 size={20} />, label: 'Consumption', children: consumptionChildren });
    }

    // Top-level: Alerts, Reports, Audit Trail
    if (hasPermission([Permissions.ALERTS_READ, Permissions.ALERTS_ACKNOWLEDGE, Permissions.ALERTS_CONFIGURE])) {
      items.push({ key: '/alerts', icon: <Bell size={20} />, label: 'Alerts' });
    }
    if (hasPermission(Permissions.REPORTS_VIEW)) {
      items.push({ key: '/reports', icon: <BarChart3 size={20} />, label: 'Reports' });
    }
    if (hasPermission([Permissions.AUDIT_VIEW, Permissions.AUDIT_VERIFY])) {
      items.push({ key: '/audit', icon: <ShieldCheck size={20} />, label: 'Audit Trail' });
    }

    // Configuration (submenu: Stores, Devices, System)
    const configChildren: MenuItem[] = [];
    if (hasPermission([Permissions.USERS_MANAGE, Permissions.SYSTEM_CONFIGURE, Permissions.DEVICES_MANAGE])) {
      configChildren.push({ key: '/admin/users', icon: <Users size={18} />, label: 'Users' });
      configChildren.push({ key: '/admin/stores', icon: <Building2 size={18} />, label: 'Stores' });
      configChildren.push({ key: '/admin/devices', icon: <Settings size={18} />, label: 'Devices' });
      configChildren.push({ key: '/admin/configuration', icon: <Settings size={18} />, label: 'System' });
    }
    if (configChildren.length > 0) {
      items.push({ key: 'configuration', icon: <Settings size={20} />, label: 'Configuration', children: configChildren });
    }

    return items;
  }, [hasPermission]);

  const selectedKey = useMemo(() => {
    const allKeys = menuItems.flatMap((item) =>
      item.children ? item.children.map((c) => c.key) : [item.key]
    );
    return allKeys
      .sort((a, b) => b.length - a.length)
      .find((key) => pathname === key || pathname.startsWith(key + '/')) ?? '/';
  }, [pathname, menuItems]);

  // Auto-expand the group containing the selected key
  const openGroupKey = useMemo(() => {
    for (const item of menuItems) {
      if (item.children?.some((c) => c.key === selectedKey)) {
        return item.key;
      }
    }
    return null;
  }, [menuItems, selectedKey]);

  const handleNavigate = (key: string) => {
    router.push(key);
    onDrawerClose?.();
  };

  const handleLogout = useCallback(async () => {
    const refreshToken = localStorage.getItem('kamats_refresh_token');
    if (refreshToken) {
      try { await logoutApi({ refreshToken }).unwrap(); } catch { /* proceed */ }
    }
    dispatch(logout());
    router.replace('/login');
  }, [dispatch, logoutApi, router]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isGroupExpanded = (key: string) => expandedGroups.has(key) || openGroupKey === key;

  const showFull = isMobile || !collapsed;

  const brand = (
    <div className={cn(
      'h-16 flex items-center shrink-0',
      showFull ? 'px-5 gap-3' : 'justify-center',
    )}>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
        <span className="text-white font-extrabold text-base font-[family-name:var(--font-display)] leading-none">K</span>
      </div>
      {showFull && (
        <div className="overflow-hidden">
          <div className="text-stone-800 font-bold text-lg font-[family-name:var(--font-display)] tracking-tight leading-tight whitespace-nowrap">
            KAMATS
          </div>
        </div>
      )}
    </div>
  );

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const isSelected = item.key === selectedKey;
    const isOpen = isGroupExpanded(item.key);

    if (item.children) {
      return (
        <div key={item.key} className="mb-0.5">
          <button
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
              showFull ? 'mx-2' : 'mx-1.5 justify-center',
              isOpen
                ? 'text-stone-800 font-semibold'
                : 'text-stone-400 hover:text-stone-600 font-medium',
            )}
            onClick={() => {
              if (!showFull && item.children?.[0]) {
                handleNavigate(item.children[0].key);
              } else {
                toggleGroup(item.key);
              }
            }}
          >
            <span className="shrink-0 opacity-70">{item.icon}</span>
            {showFull && (
              <>
                <span className="truncate flex-1 text-left">{item.label}</span>
                <ChevronDown
                  size={14}
                  className={cn(
                    'shrink-0 transition-transform duration-200 opacity-40',
                    isOpen && 'rotate-180',
                  )}
                />
              </>
            )}
          </button>
          {showFull && isOpen && (
            <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-stone-100 pl-0">
              {item.children.map((child) => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.key}
        onClick={() => handleNavigate(item.key)}
        className={cn(
          'w-full flex items-center gap-3 rounded-xl transition-all duration-200 relative',
          showFull ? 'mx-2 px-3' : 'mx-1.5 justify-center px-0',
          isChild ? 'py-2 text-[13px] ml-3' : 'py-2.5 text-sm',
          isSelected
            ? 'bg-indigo-50 text-indigo-600 font-semibold'
            : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50 font-medium',
        )}
      >
        <span className={cn('shrink-0', isSelected ? 'text-indigo-500' : 'opacity-60')}>{item.icon}</span>
        {showFull && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  const menuContent = (
    <div className="flex flex-col h-full bg-white border-r border-stone-200/60">
      {brand}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-1 pb-4">
        <nav className="space-y-0.5 px-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>
      {/* Bottom section: Logout */}
      <div className="border-t border-stone-100 p-3">
        <button
          onClick={() => setLogoutConfirmOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} className="opacity-60" />
          {showFull && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  const logoutDialog = (
    <ConfirmDialog
      open={logoutConfirmOpen}
      onOpenChange={setLogoutConfirmOpen}
      title="Log out?"
      description="Are you sure you want to log out? You will need to sign in again to access the system."
      confirmLabel="Log out"
      variant="destructive"
      onConfirm={handleLogout}
    />
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={drawerOpen} onOpenChange={(open) => !open && onDrawerClose?.()}>
          <SheetContent side="left" className="w-[270px] p-0 border-0">
            {menuContent}
          </SheetContent>
        </Sheet>
        {logoutDialog}
      </>
    );
  }

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-20 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'w-[72px]' : 'w-[260px]',
        )}
      >
        {menuContent}
      </aside>
      {logoutDialog}
    </>
  );
}
