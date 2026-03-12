import { Table, Space, Button, Input, Row, Col } from 'antd';
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

  return (
    <div>
      {(showSearch || showExport || tableTitle) && (
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            {showSearch && onSearch && (
              <Input
                placeholder={searchPlaceholder}
                prefix={<SearchOutlined />}
                allowClear
                onChange={(e) => onSearch(e.target.value)}
                style={{ width: 300 }}
              />
            )}
          </Col>
          <Col>
            <Space>
              {onRefresh && (
                <Button icon={<ReloadOutlined />} onClick={onRefresh}>
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
          </Col>
        </Row>
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
