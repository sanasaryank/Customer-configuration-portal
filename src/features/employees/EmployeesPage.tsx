import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getEmployees,
  getEmployee,
  updateEmployee,
} from '../../api/employees';
import { queryKeys } from '../../queryKeys';
import type { EmployeeListItem } from '../../types/employee';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import { useBlockToggle } from '../../hooks/useBlockToggle';
import type { FilterField } from '../../hooks/useListOperations';
import { useFilterValues } from '../../providers/FilterProvider';
import { resolveTranslation } from '../../utils/translation';
import { extractTranslation } from '../../utils/translation';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { RowActions, IconEdit, IconLock, IconUnlock, IconHistory } from '../../components/ui/RowActions';
import EmployeeModal from './EmployeeModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function EmployeesPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const navigate = useNavigate();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(undefined);
  const filterValues = useFilterValues();

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployees,
  });

  const blockMutation = useBlockToggle({
    getItem: getEmployee,
    updateItem: updateEmployee,
    listQueryKey: queryKeys.employees.all,
  });

  const filterFields = useMemo<FilterField<EmployeeListItem>[]>(() => [
    { key: 'name',      extract: (item) => extractTranslation(item.name, lang) },
    { key: 'isBlocked', extract: (item) => item.isBlocked ? 'blocked' : 'active', matchMode: 'exact' },
  ], [lang]);

  const sortFields = useMemo<Record<string, (item: EmployeeListItem) => string>>(() => ({
    id: (item) => item.id,
    name: (item) => resolveTranslation(item.name, lang),
    isBlocked: (item) => String(item.isBlocked),
  }), [lang]);

  const listOps = useListOperations<EmployeeListItem>({
    data,
    searchFields: (item) => [
      resolveTranslation(item.name, lang),
      item.username,
    ],
    filterFields,
    externalFilters: filterValues,
    sortFields,
  });

  const columns: TableColumn<EmployeeListItem>[] = [
    { key: 'id', header: t('common.id'), sortable: true, render: (row) => row.id },
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      render: (row) => resolveTranslation(row.name, lang),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <RowActions actions={[
          { key: 'edit',    icon: <IconEdit />,                                   title: t('common.edit'),    onClick: () => setModalEditId(row.id) },
          { key: 'block',   icon: row.isBlocked ? <IconLock /> : <IconUnlock />, title: row.isBlocked ? t('common.unblock') : t('common.block'), variant: row.isBlocked ? 'warning' : 'default', onClick: () => blockMutation.mutate({ id: row.id, isBlocked: !row.isBlocked }) },
          { key: 'history', icon: <IconHistory />,                                title: t('common.history'), onClick: () => navigate(`${ROUTES.HISTORY_ACTIONS}?objectId=${row.id}`) },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('employees.title')}</h1>
        <Button onClick={() => setModalEditId(null)}>{t('common.create')}</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <Table
            columns={columns}
            data={listOps.items}
            keyExtractor={(row) => row.id}
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

      {modalEditId !== undefined && (
        <EmployeeModal
          editId={modalEditId}
          onClose={() => setModalEditId(undefined)}
        />
      )}
    </div>
  );
}
