'use client';

import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Search, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PaginationInfo } from '@/lib/api/types/common';

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
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
  loading?: boolean;
  rowKey?: keyof T | ((row: T) => string);
}

export function DataTable<T extends object>({
  columns,
  data,
  pagination,
  onPageChange,
  onSortChange,
  onSearch,
  onRefresh,
  onExport,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showExport = true,
  loading = false,
  rowKey,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      if (next.length > 0) {
        onSortChange?.(next[0].id, next[0].desc ? 'desc' : 'asc');
      }
    },
    rowCount: pagination?.totalItems,
    getRowId: rowKey
      ? (row, index) =>
          typeof rowKey === 'function'
            ? rowKey(row)
            : String(row[rowKey] ?? index)
      : undefined,
  });

  const hasToolbar = showSearch || showExport || onRefresh;

  return (
    <div>
      {hasToolbar && (
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            {showSearch && onSearch && (
              <div className="relative max-w-[300px] w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  placeholder={searchPlaceholder}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-stone-200 bg-white shadow-sm"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} className="rounded-xl border-stone-200 text-stone-600 hover:bg-white hover:shadow-sm">
                <RefreshCw size={14} className="mr-1.5" />
                Refresh
              </Button>
            )}
            {showExport && onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl border-stone-200 text-stone-600 hover:bg-white hover:shadow-sm">
                    <Download size={14} className="mr-1.5" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onExport('csv')}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('excel')}>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('pdf')}>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-stone-100/80 bg-white overflow-hidden shadow-[var(--k-shadow-card)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-stone-100 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-semibold text-stone-400 bg-stone-50/50 border-b border-stone-100 cursor-pointer select-none py-3.5"
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ↑'}
                      {header.column.getIsSorted() === 'desc' && ' ↓'}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-stone-50">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-3.5">
                      <div className="h-4 bg-stone-100 rounded-lg animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-stone-400">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between mt-4 text-sm text-stone-500">
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Rows per page</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(val) => onPageChange?.(1, Number(val))}
            >
              <SelectTrigger className="w-[70px] h-8 rounded-lg border-stone-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-stone-400">
              {((pagination.page - 1) * pagination.pageSize) + 1}–
              {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-stone-200"
                onClick={() => onPageChange?.(pagination.page - 1, pagination.pageSize)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-stone-200"
                onClick={() => onPageChange?.(pagination.page + 1, pagination.pageSize)}
                disabled={pagination.page >= pagination.totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
