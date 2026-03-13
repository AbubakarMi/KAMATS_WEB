import { Table, Space, Button, Input } from 'antd';
import { DownloadOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps, TablePaginationConfig } from 'antd';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import type { PaginationInfo } from '~/api/types/common';

interface DataTableProps<T> extends Omit<TableProps<T>, 'onChange' | 'pagination' | 'title'> {
  pagination?: PaginationInfo;
  onPageChange?: (page: number, pageSize: number) => void;
  onSortChange?: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  onSearch?: (search: string) => void;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  onCreate?: () => void;
  createLabel?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showExport?: boolean;
  tableTitle?: string;
}

export function DataTable<T extends object>({
  pagination,
  onPageChange,
  onSortChange,
  onSearch,
  onRefresh,
  onExport,
  onCreate,
  createLabel,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showExport = true,
  tableTitle,
  ...tableProps
}: DataTableProps<T>) {
  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    if (pag.current && pag.pageSize) {
      onPageChange?.(pag.current, pag.pageSize);
    }

    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    if (singleSorter?.field && singleSorter?.order) {
      onSortChange?.(
        String(singleSorter.field),
        singleSorter.order === 'ascend' ? 'asc' : 'desc'
      );
    }
  };

  const antPagination: TablePaginationConfig | false = pagination
    ? {
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.totalItems,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }
    : false;

  const hasToolbar = showSearch || showExport || tableTitle;

  return (
    <div>
      {hasToolbar && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
            padding: '12px 16px',
            background: '#F8FAFC',
            borderRadius: 10,
            border: '1px solid #F1F5F9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
            {showSearch && onSearch && (
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                allowClear
                onChange={(e) => onSearch(e.target.value)}
                style={{ maxWidth: 280, width: '100%' }}
              />
            )}
          </div>
          <Space wrap size={6}>
            {onRefresh && (
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                size="small"
              >
                Refresh
              </Button>
            )}
            {showExport && onExport && (
              <>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => onExport('csv')}
                  size="small"
                >
                  CSV
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => onExport('excel')}
                  size="small"
                >
                  Excel
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => onExport('pdf')}
                  size="small"
                >
                  PDF
                </Button>
              </>
            )}
          </Space>
        </div>
      )}

      <Table<T>
        {...tableProps}
        pagination={antPagination}
        onChange={handleTableChange}
        size="middle"
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}
