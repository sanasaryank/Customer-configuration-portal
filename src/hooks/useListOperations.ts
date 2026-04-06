import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { SortState, PaginationState } from '../types/common';

export const DEFAULT_PAGE_SIZE = 20;

export interface FilterField<T> {
  key: string;
  extract: (item: T) => string;
  /**
   * 'contains' (default) — case-insensitive substring match.
   * 'exact'    — strict equality (for ID-based select filters).
   * 'array'    — extract returns comma-separated values; checks if any element equals the filter value exactly.
   */
  matchMode?: 'contains' | 'exact' | 'array';
}

interface UseListOperationsOptions<T> {
  data: T[];
  searchFields: (item: T) => string[];
  defaultSort?: SortState;
  pageSize?: number;
  /** When provided, overrides the internal search state (driven by FilterPanel). */
  externalSearch?: string;
  /** Per-field filter extractors — matched against externalFilters keys. */
  filterFields?: FilterField<T>[];
  /** Per-field filter values from FilterProvider (key → value string). */
  externalFilters?: Record<string, string>;
  /** Custom sort extractors keyed by sort.key for resolved/translated columns. */
  sortFields?: Record<string, (item: T) => string>;
}

interface UseListOperationsResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  search: string;
  setSearch: (v: string) => void;
  sort: SortState | null;
  setSort: (s: SortState) => void;
  toggleSort: (key: string) => void;
  pagination: PaginationState;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useListOperations<T>(
  opts: UseListOperationsOptions<T>,
): UseListOperationsResult<T> {
  const {
    data,
    searchFields,
    defaultSort,
    pageSize: initialPageSize,
    externalSearch,
    filterFields,
    externalFilters,
    sortFields,
  } = opts;

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>(defaultSort ?? null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize ?? DEFAULT_PAGE_SIZE,
  });

  // When externalSearch changes, reset to page 1
  const prevExternalSearch = useRef(externalSearch);
  useEffect(() => {
    if (prevExternalSearch.current !== externalSearch) {
      prevExternalSearch.current = externalSearch;
      setPagination((p) => ({ ...p, page: 1 }));
    }
  }, [externalSearch]);

  // When externalFilters change, reset to page 1
  const prevExternalFilters = useRef(externalFilters);
  useEffect(() => {
    if (prevExternalFilters.current !== externalFilters) {
      prevExternalFilters.current = externalFilters;
      setPagination((p) => ({ ...p, page: 1 }));
    }
  }, [externalFilters]);

  // The effective search: external wins when provided
  const effectiveSearch = externalSearch !== undefined ? externalSearch : search;

  // Reset to page 1 when search changes
  const handleSetSearch = (v: string) => {
    setSearch(v);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const safeData = Array.isArray(data) ? data : [];

  // Global search filter
  const searchFiltered = useMemo(() => {
    if (!effectiveSearch.trim()) return safeData;
    const q = effectiveSearch.toLowerCase();
    return safeData.filter((item) =>
      searchFields(item).some((f) => f.toLowerCase().includes(q)),
    );
  }, [data, effectiveSearch, searchFields]);

  // Per-field filter (AND logic)
  const filtered = useMemo(() => {
    if (!externalFilters || !filterFields) return searchFiltered;
    const activeFilters = Object.entries(externalFilters).filter(([, v]) => v.trim());
    if (!activeFilters.length) return searchFiltered;
    return searchFiltered.filter((item) =>
      activeFilters.every(([key, value]) => {
        const field = filterFields.find((f) => f.key === key);
        if (!field) return true;
        const extracted = field.extract(item);
        const mode = field.matchMode ?? 'contains';
        if (mode === 'exact') return extracted === value;
        if (mode === 'array') return extracted.split(',').includes(value);
        return extracted.toLowerCase().includes(value.toLowerCase().trim());
      }),
    );
  }, [searchFiltered, externalFilters, filterFields]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const extractor = sortFields?.[sort.key];
      const av = extractor
        ? extractor(a)
        : String((a as Record<string, unknown>)[sort.key] ?? '');
      const bv = extractor
        ? extractor(b)
        : String((b as Record<string, unknown>)[sort.key] ?? '');
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort, sortFields]);

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

  const toggleSort = useCallback((key: string) => {
    setSort((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  return {
    items: paged,
    totalItems,
    totalPages,
    search,
    setSearch: handleSetSearch,
    sort,
    setSort,
    toggleSort,
    pagination,
    setPage,
    setPageSize,
  };
}
