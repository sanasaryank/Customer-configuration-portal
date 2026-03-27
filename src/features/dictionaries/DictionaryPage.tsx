import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getDictionary,
  deleteDictionaryItem,
  updateDictionaryItem,
  getDictionaryItem,
} from '../../api/dictionaries';
import { queryKeys } from '../../queryKeys';
import type { DictionaryKey, DictionaryListItem } from '../../types/dictionary';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { resolveTranslation } from '../../utils/translation';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import DictionaryModal from './DictionaryModal';

const DICT_TITLE_KEYS: Record<DictionaryKey, string> = {
  integrationTypes: 'nav.integrationTypes',
  restaurantTypes: 'nav.restaurantTypes',
  hotelTypes: 'nav.hotelTypes',
  menuTypes: 'nav.menuTypes',
  priceSegments: 'nav.priceSegments',
  productGroups: 'nav.productGroups',
  customerGroups: 'nav.customerGroups',
  customerStatus: 'nav.customerStatus',
};

interface DictionaryPageProps {
  dictKey: DictionaryKey;
}

export default function DictionaryPage({ dictKey }: DictionaryPageProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(
    undefined,
  ); // undefined = closed, null = create, string = edit id
  const confirmDialog = useConfirmDialog();

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.dict(dictKey),
    queryFn: () => getDictionary(dictKey),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDictionaryItem(dictKey, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dict(dictKey) });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async ({
      id,
      isBlocked,
    }: {
      id: string;
      isBlocked: boolean;
    }) => {
      const full = await getDictionaryItem(dictKey, id);
      return updateDictionaryItem(dictKey, id, {
        ...full,
        isBlocked,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dict(dictKey) });
    },
  });

  const listOps = useListOperations<DictionaryListItem>({
    data,
    searchFields: (item) => [
      resolveTranslation(item.name, lang),
      item.description ?? '',
    ],
  });

  const handleSort = useCallback(
    (key: string) => {
      listOps.setSort({
        key,
        direction:
          listOps.sort?.key === key && listOps.sort.direction === 'asc'
            ? 'desc'
            : 'asc',
      });
    },
    [listOps],
  );

  const handleDelete = (id: string) => {
    confirmDialog.requestConfirm(async () => {
      await deleteMutation.mutateAsync(id);
    });
  };

  const columns: TableColumn<DictionaryListItem>[] = [
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      render: (row) => resolveTranslation(row.name, lang),
    },
    {
      key: 'description',
      header: t('common.description'),
      render: (row) => row.description || '—',
    },
    {
      key: 'isBlocked',
      header: t('common.status'),
      render: (row) =>
        row.isBlocked ? (
          <Badge variant="danger">{t('common.blocked')}</Badge>
        ) : (
          <Badge variant="success">{t('common.active')}</Badge>
        ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModalEditId(row.id)}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              blockMutation.mutate({ id: row.id, isBlocked: !row.isBlocked })
            }
          >
            {row.isBlocked ? t('common.unblock') : t('common.block')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800"
          >
            {t('common.delete')}
          </Button>
        </div>
      ),
    },
  ];

  const titleKey = DICT_TITLE_KEYS[dictKey];

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t(titleKey)}</h1>
        <Button onClick={() => setModalEditId(null)}>
          {t('common.create')}
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <input
          type="text"
          className="form-input"
          placeholder={t('common.search')}
          value={listOps.search}
          onChange={(e) => listOps.setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={listOps.items}
            keyExtractor={(row) => row.id}
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

      {/* Create / Edit modal */}
      {modalEditId !== undefined && (
        <DictionaryModal
          dictKey={dictKey}
          editId={modalEditId}
          onClose={() => setModalEditId(undefined)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.close}
        onConfirm={confirmDialog.confirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
