import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getAllHistory, getHistoryByObject } from '../../api/history';
import { getEmployees } from '../../api/employees';
import { queryKeys } from '../../queryKeys';
import type { HistoryListItem } from '../../types/history';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import type { FilterField } from '../../hooks/useListOperations';
import { formatTimestamp, filterByDateRange } from '../../utils/timestamp';
import { buildUsernameMap } from '../../utils/lookup';
import { useFilterValues, useRegisterFilterOptions } from '../../providers/FilterProvider';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { RowActions, IconView } from '../../components/ui/RowActions';
import { useNavigate } from 'react-router-dom';
import HistoryDetailModal from './HistoryDetailModal';

export default function HistoryPage() {
  const { t } = useTranslation();
  const { lang: _lang } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Optional filter by objectId (passed via ?objectId=... from other pages)
  const objectIdFilter = searchParams.get('objectId') ?? null;
  const [detailId, setDetailId] = useState<number | null>(null);
  const filterValues = useFilterValues();

  // Use objectId-scoped history if filter is active
  const { data = [], isLoading } = useQuery({
    queryKey: objectIdFilter
      ? queryKeys.history.byObjectId(objectIdFilter)
      : queryKeys.history.all,
    queryFn: objectIdFilter
      ? () => getHistoryByObject(objectIdFilter)
      : getAllHistory,
  });

  // Resolve userId -> employee username
  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployees,
  });

  const employeeMap = React.useMemo(() => buildUsernameMap(employees), [employees]);

  const usernameOptions = useMemo(
    () => (Array.isArray(employees) ? employees : []).map((e) => ({ value: e.username, label: e.username })),
    [employees],
  );
  useRegisterFilterOptions('username', usernameOptions);

  // Date range pre-filter (dateFrom / dateTo) — handled outside useListOperations
  const dateRangeFiltered = useMemo(
    () => filterByDateRange(Array.isArray(data) ? data : [], filterValues),
    [data, filterValues],
  );

  const filterFields = useMemo<FilterField<HistoryListItem>[]>(() => [
    { key: 'username',   extract: (item) => employeeMap.get(item.userId) ?? item.userId, matchMode: 'exact' },
    { key: 'objectType', extract: (item) => item.objectType },
    { key: 'action',     extract: (item) => item.actionType,  matchMode: 'exact' },
  ], [employeeMap]);

  const sortFields = useMemo<Record<string, (item: HistoryListItem) => string>>(() => ({
    date: (item) => String(item.date),
    username: (item) => employeeMap.get(item.userId) ?? item.userId,
    objectType: (item) => item.objectType,
    action: (item) => item.actionType,
  }), [employeeMap]);

  const listOps = useListOperations<HistoryListItem>({
    data: dateRangeFiltered,
    searchFields: (item) => [
      item.objectType,
      item.actionType,
      employeeMap.get(item.userId) ?? item.userId,
    ],
    defaultSort: { key: 'date', direction: 'desc' },
    filterFields,
    externalFilters: filterValues,
    sortFields,
  });

  const actionBadgeVariant = (action: string) => {
    if (action === 'create') return 'success' as const;
    if (action === 'delete') return 'danger' as const;
    return 'info' as const;
  };

  const actionLabel = (action: string) => {
    if (action === 'create') return t('history.create');
    if (action === 'update') return t('history.update');
    if (action === 'delete') return t('history.delete');
    return action;
  };

  const columns: TableColumn<HistoryListItem>[] = [
    {
      key: 'date',
      header: t('history.date'),
      sortable: true,
      render: (row) => formatTimestamp(row.date),
    },
    {
      key: 'username',
      header: t('history.user'),
      sortable: true,
      render: (row) => employeeMap.get(row.userId) ?? row.userId,
    },
    {
      key: 'objectType',
      header: t('history.objectType'),
      sortable: true,
    },
    {
      key: 'action',
      header: t('history.actionType'),
      sortable: true,
      render: (row) => (
        <Badge variant={actionBadgeVariant(row.actionType)}>
          {actionLabel(row.actionType)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <RowActions actions={[
          { key: 'view', icon: <IconView />, title: t('history.details'), onClick: () => setDetailId(row.id) },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {objectIdFilter && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 3L5 8l5 5" />
              </svg>
              {t('common.backToList')}
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900">{t('history.title')}</h1>
          {objectIdFilter && (
            <span className="text-sm text-gray-400 font-normal">
              — {objectIdFilter}
            </span>
          )}
        </div>
        {objectIdFilter && (
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-gray-600 underline"
            onClick={() => setSearchParams({})}
          >
            {t('history.showAll')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <Table
            columns={columns}
            data={listOps.items}
            keyExtractor={(row) => String(row.id)}
            sortKey={listOps.sort?.key}
            sortDirection={listOps.sort?.direction}
            onSort={listOps.toggleSort}
            emptyMessage={t('common.noData')}
          />
          <Pagination
            page={listOps.pagination.page}
            totalPages={listOps.totalPages}
            totalItems={listOps.totalItems}
            pageSize={listOps.pagination.pageSize}
            onPageChange={listOps.setPage}
            onPageSizeChange={listOps.setPageSize}
          />
        </>
      )}

      {detailId !== null && (
        <HistoryDetailModal historyId={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}
