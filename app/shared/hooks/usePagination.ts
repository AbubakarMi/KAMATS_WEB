import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { PaginationParams } from '~/api/types/common';

interface UsePaginationReturn {
  params: Required<PaginationParams>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  /** All current search params as plain object (includes filters) */
  allParams: Record<string, string>;
}

export function usePagination(defaults?: Partial<PaginationParams>): UsePaginationReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: Required<PaginationParams> = useMemo(() => ({
    page: Number(searchParams.get('page')) || defaults?.page || 1,
    pageSize: Number(searchParams.get('pageSize')) || defaults?.pageSize || 20,
    sortBy: searchParams.get('sortBy') || defaults?.sortBy || 'createdAt',
    sortDir: (searchParams.get('sortDir') as 'asc' | 'desc') || defaults?.sortDir || 'desc',
  }), [searchParams, defaults]);

  const setPage = useCallback((page: number) => {
    setSearchParams((prev) => {
      prev.set('page', String(page));
      return prev;
    });
  }, [setSearchParams]);

  const setPageSize = useCallback((size: number) => {
    setSearchParams((prev) => {
      prev.set('pageSize', String(size));
      prev.set('page', '1');
      return prev;
    });
  }, [setSearchParams]);

  const setSort = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    setSearchParams((prev) => {
      prev.set('sortBy', sortBy);
      prev.set('sortDir', sortDir);
      prev.set('page', '1');
      return prev;
    });
  }, [setSearchParams]);

  const allParams = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((value, key) => { obj[key] = value; });
    return obj;
  }, [searchParams]);

  return { params, setPage, setPageSize, setSort, allParams };
}
