import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getCustomers,
  deleteCustomer,
  getCustomer,
  updateCustomer,
} from '../../api/customers';
import { getDictionary } from '../../api/dictionaries';
import { getProducts } from '../../api/products';
import { queryKeys } from '../../queryKeys';
import type { CustomerListItem } from '../../types/customer';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { resolveTranslation } from '../../utils/translation';
import { buildLookupMap, resolveId, resolveIds } from '../../utils/lookup';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import CustomerModal from './CustomerModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function CustomersPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(undefined);
  const confirmDialog = useConfirmDialog();

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: getCustomers,
  });

  const { data: customerGroups = [] } = useQuery({
    queryKey: queryKeys.dict('customerGroups'),
    queryFn: () => getDictionary('customerGroups'),
  });
  const { data: customerStatuses = [] } = useQuery({
    queryKey: queryKeys.dict('customerStatus'),
    queryFn: () => getDictionary('customerStatus'),
  });
  const { data: products = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: getProducts,
  });

  const groupMap = React.useMemo(() => buildLookupMap(customerGroups, lang), [customerGroups, lang]);
  const statusMap = React.useMemo(() => buildLookupMap(customerStatuses, lang), [customerStatuses, lang]);
  const productMap = React.useMemo(() => buildLookupMap(products, lang), [products, lang]);

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, isBlocked }: { id: string; isBlocked: boolean }) => {
      const full = await getCustomer(id);
      return updateCustomer(id, { ...full, isBlocked });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  });

  const listOps = useListOperations<CustomerListItem>({
    data,
    searchFields: (item) => [
      resolveTranslation(item.generalInfo?.name, lang),
      item.generalInfo?.brandName ?? '',
      resolveId(item.generalInfo?.groupId, groupMap),
      resolveId(item.generalInfo?.statusId, statusMap),
    ],
  });

  const handleSort = useCallback((key: string) => {
    listOps.setSort({ key, direction: listOps.sort?.key === key && listOps.sort.direction === 'asc' ? 'desc' : 'asc' });
  }, [listOps]);

  const columns: TableColumn<CustomerListItem>[] = [
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      render: (row) => resolveTranslation(row.generalInfo?.name, lang),
    },
    {
      key: 'groupId',
      header: t('customers.groupId'),
      render: (row) => resolveId(row.generalInfo?.groupId, groupMap),
    },
    {
      key: 'productTypes',
      header: t('customers.productTypes'),
      render: (row) => resolveIds(row.products ?? [], productMap),
    },
    {
      key: 'statusId',
      header: t('customers.statusId'),
      render: (row) => resolveId(row.generalInfo?.statusId, statusMap),
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
        <div className="flex items-center gap-1 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => setModalEditId(row.id)}>
            {t('common.edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => blockMutation.mutate({ id: row.id, isBlocked: !row.isBlocked })}
          >
            {row.isBlocked ? t('common.unblock') : t('common.block')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800"
            onClick={() =>
              confirmDialog.requestConfirm(async () => {
                await deleteMutation.mutateAsync(row.id);
              })
            }
          >
            {t('common.delete')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`${ROUTES.HISTORY}?objectId=${row.id}`)}
          >
            {t('common.history')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('customers.title')}</h1>
        <Button onClick={() => setModalEditId(null)}>{t('common.create')}</Button>
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

      {modalEditId !== undefined && (
        <CustomerModal editId={modalEditId} onClose={() => setModalEditId(undefined)} />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.close}
        onConfirm={confirmDialog.confirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
