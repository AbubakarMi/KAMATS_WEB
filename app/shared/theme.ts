import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#2563EB',
    colorSuccess: '#059669',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorInfo: '#2563EB',
    borderRadius: 10,
    fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    colorBgLayout: '#F0F2F5',
    colorText: '#1E293B',
    colorTextSecondary: '#64748B',
    controlHeight: 38,
    fontSize: 14,
    lineHeight: 1.6,
  },
  components: {
    Layout: {
      siderBg: '#0B1120',
      headerBg: '#ffffff',
      headerHeight: 60,
      bodyBg: '#F0F2F5',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(37, 99, 235, 0.15)',
      darkItemSelectedColor: '#60A5FA',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
      darkItemColor: '#94A3B8',
      darkItemHoverColor: '#E2E8F0',
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemHeight: 40,
      iconSize: 16,
      collapsedIconSize: 18,
    },
    Table: {
      headerBg: '#F8FAFC',
      rowHoverBg: '#EFF6FF',
      headerColor: '#64748B',
      borderColor: '#F1F5F9',
    },
    Card: {
      paddingLG: 20,
      borderRadiusLG: 14,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 38,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 38,
    },
    Select: {
      borderRadius: 8,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Modal: {
      borderRadiusLG: 14,
    },
    Dropdown: {
      borderRadiusLG: 10,
    },
  },
};
