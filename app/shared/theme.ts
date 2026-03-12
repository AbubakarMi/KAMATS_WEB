import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1565C0',
    colorSuccess: '#2E7D32',
    colorWarning: '#ED6C02',
    colorError: '#D32F2F',
    colorInfo: '#0288D1',
    borderRadius: 6,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#ffffff',
      headerHeight: 56,
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
    },
    Table: {
      headerBg: '#fafafa',
      rowHoverBg: '#f0f7ff',
    },
    Card: {
      paddingLG: 20,
    },
  },
};
