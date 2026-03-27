import { useState, useMemo } from 'react';
import type { SortState, PaginationState } from '../types/common';

export const DEFAULT_PAGE_SIZE = 20;

interface UseListOperationsOptions<T> {
  data: T[];
  searchFields: (item: T) => string[];
  defaultSort?: SortState;
  pageSize?: number;
}

interface UseListOperationsResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  search: string;
  setSearch: (v: string) => void;
  sort: SortState | null;
  setSort: (s: SortState) => void;
  pagination: PaginationState;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useListOperations<T>(
  opts: UseListOperationsOptions<T>,
): UseListOperationsResult<T> {
  const { data, searchFields, defaultSort, pageSize: initialPageSize } = opts;

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>(defaultSort ?? null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize ?? DEFAULT_PAGE_SIZE,
  });

  // Reset to page 1 when search changes
  const handleSetSearch = (v: string) => {
    setSearch(v);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      searchFields(item).some((f) => f.toLowerCase().includes(q)),
    );
  }, [data, search, searchFields]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sort.key] ?? '');
      const bv = String((b as Record<string, unknown>)[sort.key] ?? '');
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));

  const paged = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return sorted.slice(start, start + pagination.pageSize);
  }, [sorted, pagination]);

  const setPage = (page: number) =>
    setPagination((p) => ({ ...p, page: Math.max(1, Math.min(page, totalPages)) }));

  const setPageSize = (size: number) =>
    setPagination({ page: 1, pageSize: size });

  return {
    items: paged,
    totalItems,
    totalPages,
    search,
    setSearch: handleSetSearch,
    sort,
    setSort,
    pagination,
    setPage,
    setPageSize,
  };
}
