import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getValidators, deleteValidator } from '../../api/validators';
import { queryKeys } from '../../queryKeys';
import type { ValidatorListItem } from '../../types/validator';
import { useListOperations } from '../../hooks/useListOperations';
import type { FilterField } from '../../hooks/useListOperations';
import { useFilterValues } from '../../providers/FilterProvider';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions, IconEdit, IconCopy, IconDelete, IconHistory } from '../../components/ui/RowActions';
import ValidatorModal from './ValidatorModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function ValidatorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(undefined);
  const [copyFromId, setCopyFromId] = useState<string | null>(null);
  const filterValues = useFilterValues();
  const confirmDialog = useConfirmDialog();

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.validators.all,
    queryFn: getValidators,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteValidator,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.validators.all, exact: true }),
  });

  const filterFields = useMemo<FilterField<ValidatorListItem>[]>(() => [
    { key: 'version',  extract: (item) => item.version },
    { key: 'endpoint', extract: (item) => item.endpoint },
  ], []);

  const sortFields = useMemo<Record<string, (item: ValidatorListItem) => string>>(() => ({
    version:  (item) => item.version,
    endpoint: (item) => item.endpoint,
  }), []);

  const listOps = useListOperations<ValidatorListItem>({
    data,
    searchFields: (item) => [item.version, item.endpoint],
    filterFields,
    externalFilters: filterValues,
    sortFields,
  });

  const columns: TableColumn<ValidatorListItem>[] = [
    { key: 'version',  header: t('validators.version'),  sortable: true, render: (row) => row.version },
    { key: 'endpoint', header: t('validators.endpoint'), sortable: true, render: (row) => row.endpoint },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <RowActions actions={[
          { key: 'edit',    icon: <IconEdit />,    title: t('common.edit'),    onClick: () => setModalEditId(row.id) },
          { key: 'copy',    icon: <IconCopy />,    title: t('common.copy'),    onClick: () => { setCopyFromId(row.id); setModalEditId(null); } },
          {
            key: 'delete',
            icon: <IconDelete />,
            title: t('common.delete'),
            variant: 'danger',
            onClick: () => confirmDialog.requestConfirm(async () => { deleteMutation.mutate(row.id); }),
          },
          { key: 'history', icon: <IconHistory />, title: t('common.history'), onClick: () => navigate(`${ROUTES.HISTORY_ACTIONS}?objectId=${row.id}`) },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('validators.title')}</h1>
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
        <ValidatorModal editId={modalEditId} copyFromId={copyFromId} onClose={() => { setModalEditId(undefined); setCopyFromId(null); }} />
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={t('common.deleteTitle')}
        message={t('common.confirmDelete')}
        onConfirm={confirmDialog.confirm}
        onClose={confirmDialog.close}
      />
    </div>
  );
}
