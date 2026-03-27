import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDistricts, deleteDistrict, getDistrict, updateDistrict } from '../../api/districts';
import { getCities } from '../../api/cities';
import { queryKeys } from '../../queryKeys';
import type { DistrictListItem } from '../../types/district';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { resolveTranslation } from '../../utils/translation';
import { buildLookupMap, resolveId } from '../../utils/lookup';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import DistrictModal from './DistrictModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function DistrictsPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(undefined);
  const confirmDialog = useConfirmDialog();

  const { data = [], isLoading } = useQuery({ queryKey: queryKeys.districts.all, queryFn: getDistricts });
  const { data: cities = [] } = useQuery({ queryKey: queryKeys.cities.all, queryFn: getCities });
  const cityMap = React.useMemo(() => buildLookupMap(cities, lang), [cities, lang]);

  const deleteMutation = useMutation({
    mutationFn: deleteDistrict,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.districts.all }),
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, isBlocked }: { id: string; isBlocked: boolean }) => {
      const full = await getDistrict(id);
      return updateDistrict(id, { ...full, isBlocked });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.districts.all }),
  });

  const listOps = useListOperations<DistrictListItem>({
    data,
    searchFields: (item) => [resolveTranslation(item.name, lang), item.description ?? '', resolveId(item.cityId, cityMap)],
  });

  const handleSort = useCallback((key: string) => {
    listOps.setSort({ key, direction: listOps.sort?.key === key && listOps.sort.direction === 'asc' ? 'desc' : 'asc' });
  }, [listOps]);

  const columns: TableColumn<DistrictListItem>[] = [
    { key: 'name', header: t('common.name'), sortable: true, render: (row) => resolveTranslation(row.name, lang) },
    { key: 'cityId', header: t('districts.city'), render: (row) => resolveId(row.cityId, cityMap) },
    { key: 'description', header: t('common.description'), render: (row) => row.description || '—' },
    {
      key: 'isBlocked', header: t('common.status'),
      render: (row) => row.isBlocked
        ? <Badge variant="danger">{t('common.blocked')}</Badge>
        : <Badge variant="success">{t('common.active')}</Badge>,
    },
    {
      key: 'actions', header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-1 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => setModalEditId(row.id)}>{t('common.edit')}</Button>
          <Button variant="ghost" size="sm" onClick={() => blockMutation.mutate({ id: row.id, isBlocked: !row.isBlocked })}>
            {row.isBlocked ? t('common.unblock') : t('common.block')}
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800"
            onClick={() => confirmDialog.requestConfirm(async () => { await deleteMutation.mutateAsync(row.id); })}>
            {t('common.delete')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`${ROUTES.HISTORY}?objectId=${row.id}`)}>
            {t('common.history')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('districts.title')}</h1>
        <Button onClick={() => setModalEditId(null)}>{t('common.create')}</Button>
      </div>
      <div className="max-w-sm">
        <input type="text" className="form-input" placeholder={t('common.search')}
          value={listOps.search} onChange={(e) => listOps.setSearch(e.target.value)} />
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <Table columns={columns} data={listOps.items} keyExtractor={(row) => row.id}
            sortKey={listOps.sort?.key} sortDirection={listOps.sort?.direction} onSort={handleSort}
            emptyMessage={t('common.noData')} />
          <Pagination page={listOps.pagination.page} totalPages={listOps.totalPages}
            totalItems={listOps.totalItems} pageSize={listOps.pagination.pageSize}
            onPageChange={listOps.setPage} onPageSizeChange={listOps.setPageSize} />
        </>
      )}
      {modalEditId !== undefined && (
        <DistrictModal editId={modalEditId} onClose={() => setModalEditId(undefined)} />
      )}
      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={confirmDialog.close}
        onConfirm={confirmDialog.confirm} loading={deleteMutation.isPending} />
    </div>
  );
}
