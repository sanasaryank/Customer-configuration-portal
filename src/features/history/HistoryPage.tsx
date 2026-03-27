import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getAllHistory, getHistoryByObject } from '../../api/history';
import { getEmployees } from '../../api/employees';
import { queryKeys } from '../../queryKeys';
import type { HistoryListItem } from '../../types/history';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import { resolveTranslation } from '../../utils/translation';
import { formatTimestamp } from '../../utils/timestamp';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import HistoryDetailModal from './HistoryDetailModal';

export default function HistoryPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Optional filter by objectId (passed via ?objectId=... from other pages)
  const objectIdFilter = searchParams.get('objectId') ?? null;
  const [detailId, setDetailId] = useState<number | null>(null);

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

  const employeeMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const emp of employees) {
      map.set(emp.id, emp.username);
    }
    return map;
  }, [employees]);

  const listOps = useListOperations<HistoryListItem>({
    data,
    searchFields: (item) => [
      item.objectType,
      item.objectId,
      item.actionType,
      employeeMap.get(item.userId) ?? item.userId,
    ],
    defaultSort: { key: 'date', direction: 'desc' },
  });

  const handleSort = useCallback((key: string) => {
    listOps.setSort({
      key,
      direction: listOps.sort?.key === key && listOps.sort.direction === 'asc' ? 'desc' : 'asc',
    });
  }, [listOps]);

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
      render: (row) => formatTimestamp(row.date), // seconds -> formatted
    },
    {
      key: 'userId',
      header: t('history.user'),
      render: (row) => employeeMap.get(row.userId) ?? row.userId,
    },
    {
      key: 'actionType',
      header: t('history.actionType'),
      render: (row) => (
        <Badge variant={actionBadgeVariant(row.actionType)}>
          {actionLabel(row.actionType)}
        </Badge>
      ),
    },
    { key: 'objectType', header: t('history.objectType'), sortable: true },
    { key: 'objectId', header: t('history.objectId') },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setDetailId(row.id)}>
          {t('history.details')}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('history.title')}</h1>
          {objectIdFilter && (
            <p className="text-sm text-gray-500">
              Filtered: objectId = {objectIdFilter}{' '}
              <button
                type="button"
                className="text-primary-600 underline"
                onClick={() => setSearchParams({})}
              >
                Clear
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-sm">
        <input
          type="text"
          className="form-input"
          placeholder={t('common.search')}
          value={listOps.search}
          onChange={(e) => listOps.setSearch(e.target.value)}
        />
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
            onSort={handleSort}
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
