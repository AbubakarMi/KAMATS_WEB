import { Button, Dropdown } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface ExportButtonsProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  loading?: boolean;
}

export function ExportButtons({ onExport, loading }: ExportButtonsProps) {
  const items: MenuProps['items'] = [
    { key: 'csv', label: 'Export as CSV', onClick: () => onExport('csv') },
    { key: 'excel', label: 'Export as Excel', onClick: () => onExport('excel') },
    { key: 'pdf', label: 'Export as PDF', onClick: () => onExport('pdf') },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button icon={<DownloadOutlined />} loading={loading}>
        Export
      </Button>
    </Dropdown>
  );
}
