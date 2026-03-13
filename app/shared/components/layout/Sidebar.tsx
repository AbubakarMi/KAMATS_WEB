import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Layout, Menu, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShopOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  ExperimentOutlined,
  DashboardFilled,
  InboxOutlined,
  DatabaseOutlined,
  SwapOutlined,
  BarChartOutlined,
  AlertOutlined,
  AuditOutlined,
  SettingOutlined,
  BankOutlined,
  CalculatorOutlined,
  WarningOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuth } from '~/shared/hooks';
import { Permissions } from '~/shared/utils/permissions';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile?: boolean;
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}

export default function Sidebar({ collapsed, onCollapse, isMobile, drawerOpen, onDrawerClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [];

    // Dashboard — visible to all authenticated users
    items.push({
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    });

    // Procurement group
    const procurementChildren: MenuItem[] = [];
    if (hasPermission([Permissions.SUPPLIERS_CREATE, Permissions.SUPPLIERS_READ, Permissions.SUPPLIERS_APPROVE])) {
      procurementChildren.push({ key: '/suppliers', icon: <ShopOutlined />, label: 'Suppliers' });
    }
    if (hasPermission([Permissions.PR_CREATE, Permissions.PR_READ, Permissions.PR_APPROVE])) {
      procurementChildren.push({ key: '/purchase-requisitions', icon: <FileTextOutlined />, label: 'Requisitions' });
    }
    if (hasPermission([Permissions.PO_CREATE, Permissions.PO_READ, Permissions.PO_APPROVE_MANAGER, Permissions.PO_APPROVE_FINANCE])) {
      procurementChildren.push({ key: '/purchase-orders', icon: <ShoppingCartOutlined />, label: 'Purchase Orders' });
    }
    if (procurementChildren.length > 0) {
      items.push({
        key: 'procurement',
        icon: <ShoppingCartOutlined />,
        label: 'Procurement',
        children: procurementChildren,
      });
    }

    // Receiving group
    const receivingChildren: MenuItem[] = [];
    if (hasPermission([Permissions.DVR_CREATE, Permissions.DVR_READ, Permissions.INSPECTION_READ])) {
      receivingChildren.push({ key: '/quality/dvr', icon: <ExperimentOutlined />, label: 'Quality / DVR' });
    }
    if (hasPermission([Permissions.WEIGHBRIDGE_RECORD, Permissions.WEIGHBRIDGE_READ, Permissions.WEIGHBRIDGE_OVERRIDE])) {
      receivingChildren.push({ key: '/weighbridge', icon: <DashboardFilled />, label: 'Weighbridge' });
    }
    if (hasPermission([Permissions.GRN_CREATE, Permissions.GRN_READ])) {
      receivingChildren.push({ key: '/grn', icon: <InboxOutlined />, label: 'GRN' });
    }
    if (receivingChildren.length > 0) {
      items.push({
        key: 'receiving',
        icon: <InboxOutlined />,
        label: 'Receiving',
        children: receivingChildren,
      });
    }

    // Inventory group
    const inventoryChildren: MenuItem[] = [];
    if (hasPermission([Permissions.LOTS_READ, Permissions.ITEMS_READ])) {
      inventoryChildren.push({ key: '/lots', icon: <AppstoreOutlined />, label: 'Lots & Items' });
    }
    if (hasPermission([Permissions.LOCATIONS_READ, Permissions.LOCATIONS_MANAGE])) {
      inventoryChildren.push({ key: '/warehouse/default', icon: <BankOutlined />, label: 'Warehouse' });
    }
    if (hasPermission(Permissions.LEDGER_READ)) {
      inventoryChildren.push({ key: '/ledger/default', icon: <DatabaseOutlined />, label: 'Stock Ledger' });
    }
    if (hasPermission([Permissions.STOCKCOUNT_CREATE, Permissions.STOCKCOUNT_READ, Permissions.STOCKCOUNT_EXECUTE, Permissions.STOCKCOUNT_APPROVE])) {
      inventoryChildren.push({ key: '/stock-counts', icon: <CalculatorOutlined />, label: 'Stock Count' });
    }
    if (inventoryChildren.length > 0) {
      items.push({
        key: 'inventory',
        icon: <DatabaseOutlined />,
        label: 'Inventory',
        children: inventoryChildren,
      });
    }

    // Distribution group
    const distributionChildren: MenuItem[] = [];
    if (hasPermission([Permissions.STO_CREATE, Permissions.STO_READ, Permissions.STO_APPROVE_CENTRAL_UNIT, Permissions.STO_APPROVE_UNIT_USER])) {
      distributionChildren.push({ key: '/transfers', icon: <SwapOutlined />, label: 'Transfers' });
    }
    if (distributionChildren.length > 0) {
      items.push({
        key: 'distribution',
        icon: <SwapOutlined />,
        label: 'Distribution',
        children: distributionChildren,
      });
    }

    // Consumption group
    const consumptionChildren: MenuItem[] = [];
    if (hasPermission([Permissions.CONSUMPTION_RECORD, Permissions.CONSUMPTION_READ, Permissions.CONSUMPTION_ACKNOWLEDGE])) {
      consumptionChildren.push({ key: '/consumption', icon: <BarChartOutlined />, label: 'Consumption' });
    }
    if (hasPermission([Permissions.DOSAGE_READ, Permissions.DOSAGE_CONFIGURE])) {
      consumptionChildren.push({ key: '/dosage', icon: <ExperimentOutlined />, label: 'Dosage Config' });
    }
    if (hasPermission([Permissions.WRITEOFF_RAISE, Permissions.WRITEOFF_READ, Permissions.WRITEOFF_APPROVE_MINOR, Permissions.WRITEOFF_APPROVE_SIGNIFICANT, Permissions.WRITEOFF_APPROVE_CRITICAL])) {
      consumptionChildren.push({ key: '/write-offs', icon: <WarningOutlined />, label: 'Write-Offs' });
    }
    if (consumptionChildren.length > 0) {
      items.push({
        key: 'consumption-group',
        icon: <BarChartOutlined />,
        label: 'Consumption',
        children: consumptionChildren,
      });
    }

    // System group
    const systemChildren: MenuItem[] = [];
    if (hasPermission([Permissions.ALERTS_READ, Permissions.ALERTS_ACKNOWLEDGE, Permissions.ALERTS_CONFIGURE])) {
      systemChildren.push({ key: '/alerts', icon: <AlertOutlined />, label: 'Alerts' });
    }
    if (hasPermission(Permissions.REPORTS_VIEW)) {
      systemChildren.push({ key: '/reports', icon: <BarChartOutlined />, label: 'Reports' });
    }
    if (hasPermission([Permissions.AUDIT_VIEW, Permissions.AUDIT_VERIFY])) {
      systemChildren.push({ key: '/audit', icon: <AuditOutlined />, label: 'Audit Trail' });
    }
    if (hasPermission([Permissions.USERS_MANAGE, Permissions.SYSTEM_CONFIGURE, Permissions.DEVICES_MANAGE])) {
      systemChildren.push({ key: '/admin/users', icon: <TeamOutlined />, label: 'Users' });
      systemChildren.push({ key: '/admin/stores', icon: <BankOutlined />, label: 'Stores' });
      systemChildren.push({ key: '/admin/devices', icon: <SettingOutlined />, label: 'Devices' });
      systemChildren.push({ key: '/admin/configuration', icon: <SettingOutlined />, label: 'Configuration' });
    }
    if (systemChildren.length > 0) {
      items.push({
        key: 'system',
        icon: <SettingOutlined />,
        label: 'System',
        children: systemChildren,
      });
    }

    return items;
  }, [hasPermission]);

  // Determine active key from current path
  const selectedKeys = useMemo(() => {
    const path = location.pathname;
    // Match the deepest route key that the path starts with
    const allKeys = menuItems.flatMap((item) => {
      if (item && 'children' in item && item.children) {
        return item.children.map((child) => (child as { key: string })?.key).filter(Boolean);
      }
      return [(item as { key: string })?.key].filter(Boolean);
    });
    const match = allKeys
      .filter((key): key is string => typeof key === 'string')
      .sort((a, b) => b.length - a.length)
      .find((key) => path === key || path.startsWith(key + '/'));
    return match ? [match] : ['/'];
  }, [location.pathname, menuItems]);

  // Auto-open parent group
  const openKeys = useMemo(() => {
    for (const item of menuItems) {
      if (item && 'children' in item && item.children) {
        const childKeys = item.children.map((c) => (c as { key: string })?.key);
        if (childKeys.some((k) => selectedKeys.includes(k as string))) {
          return [(item as { key: string }).key];
        }
      }
    }
    return [];
  }, [menuItems, selectedKeys]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
    onDrawerClose?.();
  };

  const brand = (
    <div
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: isMobile ? 20 : (collapsed ? 16 : 20),
        letterSpacing: 2,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {isMobile || !collapsed ? 'KAMATS' : 'K'}
    </div>
  );

  const menuContent = (
    <>
      {brand}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ paddingBottom: 48 }}
      />
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={onDrawerClose}
        width={240}
        styles={{ body: { padding: 0, background: '#001529' } }}
        closable={false}
      >
        {menuContent}
      </Drawer>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={240}
      style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
    >
      {menuContent}
    </Sider>
  );
}
