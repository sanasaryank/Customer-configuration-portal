import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getProducts, getProduct, updateProduct } from '../../api/products';
import { getDictionary } from '../../api/dictionaries';
import { queryKeys } from '../../queryKeys';
import type { ProductListItem } from '../../types/product';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import { useBlockToggle } from '../../hooks/useBlockToggle';
import type { FilterField } from '../../hooks/useListOperations';
import { useFilterValues, useRegisterFilterOptions } from '../../providers/FilterProvider';
import { resolveTranslation } from '../../utils/translation';
import { extractTranslation } from '../../utils/translation';
import { buildLookupMap, resolveId } from '../../utils/lookup';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { RowActions, IconEdit, IconLock, IconUnlock, IconHistory } from '../../components/ui/RowActions';
import ProductModal from './ProductModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function ProductsPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const navigate = useNavigate();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(undefined);
  const filterValues = useFilterValues();

  const { data = [], isLoading } = useQuery({ queryKey: queryKeys.products.all, queryFn: getProducts });
  const { data: productGroups = [] } = useQuery({ queryKey: queryKeys.dict('productGroups'), queryFn: () => getDictionary('productGroups') });
  const groupMap = React.useMemo(() => buildLookupMap(productGroups, lang), [productGroups, lang]);

  const blockMutation = useBlockToggle({
    getItem: getProduct,
    updateItem: updateProduct,
    listQueryKey: queryKeys.products.all,
  });

  const groupOptions = useMemo(
    () => productGroups.map((g) => ({ value: g.id, label: resolveTranslation(g.name, lang) })),
    [productGroups, lang],
  );
  useRegisterFilterOptions('groupName', groupOptions);

  const filterFields = useMemo<FilterField<ProductListItem>[]>(() => [
    { key: 'groupName', extract: (item) => item.groupId ?? '', matchMode: 'exact' },
    { key: 'name',      extract: (item) => extractTranslation(item.name, lang) },
    { key: 'isBlocked', extract: (item) => item.isBlocked ? 'blocked' : 'active', matchMode: 'exact' },
  ], [lang]);

  const sortFields = useMemo<Record<string, (item: ProductListItem) => string>>(() => ({
    id: (item) => item.id,
    groupName: (item) => resolveId(item.groupId, groupMap),
    name: (item) => resolveTranslation(item.name, lang),
    isBlocked: (item) => String(item.isBlocked),
  }), [lang, groupMap]);

  const listOps = useListOperations<ProductListItem>({
    data,
    searchFields: (item) => [resolveTranslation(item.name, lang), resolveId(item.groupId, groupMap)],
    filterFields,
    externalFilters: filterValues,
    sortFields,
  });

  const columns: TableColumn<ProductListItem>[] = [
    { key: 'id', header: t('common.id'), sortable: true, render: (row) => row.id },
    { key: 'groupName', header: t('products.group'), sortable: true, render: (row) => resolveId(row.groupId, groupMap) },
    { key: 'name', header: t('common.name'), sortable: true, render: (row) => resolveTranslation(row.name, lang) },
    {
      key: 'actions', header: t('common.actions'),
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
        <h1 className="text-xl font-semibold text-gray-900">{t('products.title')}</h1>
        <Button onClick={() => setModalEditId(null)}>{t('common.create')}</Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <Table columns={columns} data={listOps.items} keyExtractor={(row) => row.id}
            sortKey={listOps.sort?.key} sortDirection={listOps.sort?.direction} onSort={listOps.toggleSort}
            emptyMessage={t('common.noData')} />
          <Pagination page={listOps.pagination.page} totalPages={listOps.totalPages}
            totalItems={listOps.totalItems} pageSize={listOps.pagination.pageSize}
            onPageChange={listOps.setPage} onPageSizeChange={listOps.setPageSize} />
        </>
      )}
      {modalEditId !== undefined && (
        <ProductModal editId={modalEditId} onClose={() => setModalEditId(undefined)} />
      )}
    </div>
  );
}
