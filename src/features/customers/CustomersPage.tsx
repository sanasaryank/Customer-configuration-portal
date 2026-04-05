import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getCustomers,
  getCustomer,
  updateCustomer,
} from '../../api/customers';
import { getDictionary } from '../../api/dictionaries';
import { getProducts } from '../../api/products';
import { queryKeys } from '../../queryKeys';
import type { CustomerListItem } from '../../types/customer';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import type { FilterField } from '../../hooks/useListOperations';
import { useFilterValues, useRegisterFilterOptions } from '../../providers/FilterProvider';
import { resolveTranslation } from '../../utils/translation';
import { extractTranslation } from '../../utils/translation';
import { buildLookupMap, resolveId, resolveIds } from '../../utils/lookup';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { RowActions, IconEdit, IconLock, IconUnlock, IconHistory, IconMoveLicense, IconRenewLicense } from '../../components/ui/RowActions';
import CustomerModal from './CustomerModal';
import MoveLicenseModal from './MoveLicenseModal';
import RenewLicenseModal from './RenewLicenseModal';
import type { RenewLicenseProduct } from './RenewLicenseModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { formatTimestamp } from '../../utils/timestamp';

export default function CustomersPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(undefined);
  const [moveLicenseSrc, setMoveLicenseSrc] = useState<{ id: string; name: string } | null>(null);
  const [renewLicenseSrc, setRenewLicenseSrc] = useState<{ id: string; name: string; products: RenewLicenseProduct[] } | null>(null);
  const filterValues = useFilterValues();

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

  const blockMutation = useMutation({
    mutationFn: async ({ id, isBlocked }: { id: string; isBlocked: boolean }) => {
      const full = await getCustomer(id);
      return updateCustomer(id, { ...full, generalInfo: { ...full.generalInfo, isBlocked } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  });

  // Register dropdown options for select filter fields
  const groupOptions = useMemo(
    () => customerGroups.map((g) => ({ value: g.id, label: resolveTranslation(g.name, lang) })),
    [customerGroups, lang],
  );
  const productTypeOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: resolveTranslation(p.name, lang) })),
    [products, lang],
  );
  const statusOptions = useMemo(
    () => customerStatuses.map((s) => ({ value: s.id, label: resolveTranslation(s.name, lang) })),
    [customerStatuses, lang],
  );
  useRegisterFilterOptions('group', groupOptions);
  useRegisterFilterOptions('productTypes', productTypeOptions);
  useRegisterFilterOptions('status', statusOptions);

  const filterFields = useMemo<FilterField<CustomerListItem>[]>(() => [
    { key: 'name',         extract: (item) => extractTranslation(item.generalInfo?.name, lang) },
    { key: 'group',        extract: (item) => item.generalInfo?.groupId ?? '',          matchMode: 'exact' },
    { key: 'productTypes', extract: (item) => (item.licenseInfo?.products ?? []).map((p) => p.productId).join(','), matchMode: 'array' },
    { key: 'status',       extract: (item) => item.generalInfo?.statusId ?? '',         matchMode: 'exact' },
    { key: 'isBlocked',    extract: (item) => item.generalInfo?.isBlocked ? 'blocked' : 'active',   matchMode: 'exact' },
  ], [lang]);

  const sortFields = useMemo<Record<string, (item: CustomerListItem) => string>>(() => ({
    id: (item) => item.id,
    name: (item) => resolveTranslation(item.generalInfo?.name, lang),
    group: (item) => resolveId(item.generalInfo?.groupId, groupMap),
    productTypes: (item) => resolveIds((item.licenseInfo?.products ?? []).map((p) => p.productId), productMap),
    status: (item) => resolveId(item.generalInfo?.statusId, statusMap),
    isBlocked: (item) => String(item.generalInfo?.isBlocked),
    lastUpdated: (item) => String(item.lastUpdated ?? 0),
  }), [lang, groupMap, productMap, statusMap]);

  const listOps = useListOperations<CustomerListItem>({
    data,
    searchFields: (item) => [
      resolveTranslation(item.generalInfo?.name, lang),
      item.generalInfo?.brandName ?? '',
      resolveId(item.generalInfo?.groupId, groupMap),
      resolveId(item.generalInfo?.statusId, statusMap),
    ],
    filterFields,
    externalFilters: filterValues,
    sortFields,
  });

  const handleSort = useCallback((key: string) => {
    listOps.setSort({ key, direction: listOps.sort?.key === key && listOps.sort.direction === 'asc' ? 'desc' : 'asc' });
  }, [listOps]);

  const columns: TableColumn<CustomerListItem>[] = [
    { key: 'id', header: t('common.id'), sortable: true, render: (row) => row.id },
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      render: (row) => resolveTranslation(row.generalInfo?.name, lang),
    },
    {
      key: 'group',
      header: t('customers.groupId'),
      sortable: true,
      render: (row) => resolveId(row.generalInfo?.groupId, groupMap),
    },
    {
      key: 'productTypes',
      header: t('customers.productTypes'),
      sortable: true,
      render: (row) => resolveIds((row.licenseInfo?.products ?? []).map((p) => p.productId), productMap),
    },
    {
      key: 'status',
      header: t('customers.statusId'),
      sortable: true,
      render: (row) => resolveId(row.generalInfo?.statusId, statusMap),
    },
    {
      key: 'lastUpdated',
      header: t('customers.lastUpdate'),
      sortable: true,
      render: (row) => row.lastUpdated ? formatTimestamp(row.lastUpdated) : '—',
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <RowActions actions={[
          { key: 'edit',          icon: <IconEdit />,                                               title: t('common.edit'),              onClick: () => setModalEditId(row.id) },
          { key: 'block',         icon: row.generalInfo?.isBlocked ? <IconLock /> : <IconUnlock />, title: row.generalInfo?.isBlocked ? t('common.unblock') : t('common.block'), variant: row.generalInfo?.isBlocked ? 'warning' as const : 'default' as const, onClick: () => blockMutation.mutate({ id: row.id, isBlocked: !row.generalInfo?.isBlocked }) },
          { key: 'renewLicense',  icon: <IconRenewLicense />,                                       title: t('customers.renewLicense'),   onClick: () => setRenewLicenseSrc({ id: row.id, name: resolveTranslation(row.generalInfo?.name, lang), products: (row.licenseInfo?.products ?? []).map((p) => ({ productId: p.productId, name: productMap.get(p.productId) || p.productId })) }) },
          { key: 'moveLicense',   icon: <IconMoveLicense />,                                        title: t('customers.moveLicense'),    onClick: () => setMoveLicenseSrc({ id: row.id, name: resolveTranslation(row.generalInfo?.name, lang) }) },
          { key: 'history',       icon: <IconHistory />,                                            title: t('common.history'),           onClick: () => navigate(`${ROUTES.HISTORY}?objectId=${row.id}`) },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('customers.title')}</h1>
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

      {moveLicenseSrc !== null && (
        <MoveLicenseModal
          srcId={moveLicenseSrc.id}
          srcName={moveLicenseSrc.name}
          onClose={() => setMoveLicenseSrc(null)}
        />
      )}

      {renewLicenseSrc !== null && (
        <RenewLicenseModal
          customerId={renewLicenseSrc.id}
          customerName={renewLicenseSrc.name}
          products={renewLicenseSrc.products}
          onClose={() => setRenewLicenseSrc(null)}
        />
      )}
    </div>
  );
}
