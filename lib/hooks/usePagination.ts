import { useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { PaginationParams } from '@/lib/api/types/common';

interface UsePaginationReturn {
  params: Required<PaginationParams>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  /** All current search params as plain object (includes filters) */
  allParams: Record<string, string>;
}

export function usePagination(defaults?: Partial<PaginationParams>): UsePaginationReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params: Required<PaginationParams> = useMemo(() => ({
    page: Number(searchParams.get('page')) || defaults?.page || 1,
    pageSize: Number(searchParams.get('pageSize')) || defaults?.pageSize || 20,
    sortBy: searchParams.get('sortBy') || defaults?.sortBy || 'createdAt',
    sortDir: (searchParams.get('sortDir') as 'asc' | 'desc') || defaults?.sortDir || 'desc',
  }), [searchParams, defaults]);

  const updateParams = useCallback((updater: (prev: URLSearchParams) => URLSearchParams) => {
    const next = updater(new URLSearchParams(searchParams.toString()));
    router.push(`${pathname}?${next.toString()}`);
  }, [searchParams, router, pathname]);

  const setPage = useCallback((page: number) => {
    updateParams((prev) => {
      prev.set('page', String(page));
      return prev;
    });
  }, [updateParams]);

  const setPageSize = useCallback((size: number) => {
    updateParams((prev) => {
      prev.set('pageSize', String(size));
      prev.set('page', '1');
      return prev;
    });
  }, [updateParams]);

  const setSort = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    updateParams((prev) => {
      prev.set('sortBy', sortBy);
      prev.set('sortDir', sortDir);
      prev.set('page', '1');
      return prev;
    });
  }, [updateParams]);

  const allParams = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((value, key) => { obj[key] = value; });
    return obj;
  }, [searchParams]);

  return { params, setPage, setPageSize, setSort, allParams };
}
