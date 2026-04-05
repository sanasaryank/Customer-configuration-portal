import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { FilterOption } from '../constants/filterConfigs';

interface FilterContextValue {
  getFilters: (path: string) => Record<string, string>;
  setFilter: (path: string, key: string, value: string) => void;
  clearFilters: (path: string) => void;
  getFieldOptions: (path: string, key: string) => FilterOption[];
  registerOptions: (path: string, key: string, options: FilterOption[]) => void;
  isOpen: boolean;
  togglePanel: () => void;
  closePanel: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilterContext must be used within FilterProvider');
  return ctx;
}

/**
 * Read-only hook for pages — returns the current route's per-field filter values.
 * Pass the result to useListOperations as externalFilters.
 */
export function useFilterValues(): Record<string, string> {
  const { pathname } = useLocation();
  const { getFilters } = useFilterContext();
  return getFilters(pathname);
}

/**
 * Hook for pages — registers dynamic select options for a given key on the current route.
 * Pages must memoize the options array to avoid unnecessary re-registrations.
 */
export function useRegisterFilterOptions(key: string, options: FilterOption[]): void {
  const { pathname } = useLocation();
  const { registerOptions } = useFilterContext();
  useEffect(() => {
    if (key) registerOptions(pathname, key, options);
  }, [pathname, key, options, registerOptions]);
}

interface FilterProviderProps {
  children: React.ReactNode;
}

// Stable empty object returned by getFilters when a path has no active filters.
// Must not be inline (`?? {}`) — that creates a new reference every call,
// causing useListOperations' reference-equality check to fire on every render.
const EMPTY_FILTERS: Record<string, string> = {};

export function FilterProvider({ children }: FilterProviderProps) {
  const [fieldFilters, setFieldFilters] = useState<Record<string, Record<string, string>>>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, Record<string, FilterOption[]>>>({});
  const [isOpen, setIsOpen] = useState(true);

  const getFilters = useCallback(
    (path: string) => fieldFilters[path] ?? EMPTY_FILTERS,
    [fieldFilters],
  );

  const setFilter = useCallback((path: string, key: string, value: string) => {
    setFieldFilters((prev) => ({
      ...prev,
      [path]: { ...(prev[path] ?? {}), [key]: value },
    }));
  }, []);

  const clearFilters = useCallback((path: string) => {
    setFieldFilters((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  const getFieldOptions = useCallback(
    (path: string, key: string): FilterOption[] => fieldOptions[path]?.[key] ?? [],
    [fieldOptions],
  );

  const registerOptions = useCallback((path: string, key: string, options: FilterOption[]) => {
    setFieldOptions((prev) => {
      const current = prev[path]?.[key];
      // Bail out when reference is identical (memoized array didn't change)
      if (current === options) return prev;
      // Bail out when both are empty — avoids a re-render storm during initial data loading:
      // pages use `data = []` as React Query's default which creates a new [] every render
      // while the query is still in-flight, causing this callback to fire on every render.
      if (!options.length && !current?.length) return prev;
      return { ...prev, [path]: { ...(prev[path] ?? {}), [key]: options } };
    });
  }, []);

  const togglePanel = useCallback(() => setIsOpen((v) => !v), []);
  const closePanel = useCallback(() => setIsOpen(false), []);

  const contextValue = useMemo<FilterContextValue>(
    () => ({ getFilters, setFilter, clearFilters, getFieldOptions, registerOptions, isOpen, togglePanel, closePanel }),
    [getFilters, setFilter, clearFilters, getFieldOptions, registerOptions, isOpen, togglePanel, closePanel],
  );

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}
