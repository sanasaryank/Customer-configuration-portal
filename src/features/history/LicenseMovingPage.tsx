import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getLicenseMovingHistory } from '../../api/history';
import { getCustomers } from '../../api/customers';
import { getEmployees } from '../../api/employees';
import { getProducts } from '../../api/products';
import { queryKeys } from '../../queryKeys';
import type { LicenseMovingItem } from '../../types/history';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import type { FilterField } from '../../hooks/useListOperations';
import { useFilterValues, useRegisterFilterOptions } from '../../providers/FilterProvider';
import { resolveTranslation } from '../../utils/translation';
import { formatTimestamp, filterByDateRange } from '../../utils/timestamp';
import { buildUsernameMap } from '../../utils/lookup';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { RowActions, IconView } from '../../components/ui/RowActions';
import { Modal } from '../../components/ui/Modal';

// ── Detail modal ──────────────────────────────────────────────────────────────

interface LicenseDetailModalProps {
  item: LicenseMovingItem;
  fromName: string;
  toName: string;
  userName: string;
  productName: string;
  onClose: () => void;
}

function JsonTree({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const indent = depth * 16;

  if (value === null) return <span className="text-gray-400 italic">null</span>;
  if (typeof value === 'boolean') return <span className="text-purple-700">{String(value)}</span>;
  if (typeof value === 'number') return <span className="text-blue-700">{String(value)}</span>;
  if (typeof value === 'string') return <span className="text-green-700">"{value}"</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400">[]</span>;
    return (
      <div style={{ marginLeft: indent }}>
        {value.map((v, i) => (
          <div key={i} className="flex gap-1">
            <span className="text-gray-400 select-none">{i}:</span>
            <JsonTree value={v} depth={0} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-gray-400">{'{}'}</span>;
    return (
      <div style={{ marginLeft: indent }}>
        {entries.map(([k, v]) => (
          <div key={k} className="flex gap-1.5 items-start py-0.5">
            <span className="text-gray-600 font-mono text-xs shrink-0">{k}:</span>
            {typeof v === 'object' && v !== null && !Array.isArray(v) ? (
              <div className="pl-3 border-l border-gray-200">
                <JsonTree value={v} depth={0} />
              </div>
            ) : (
              <JsonTree value={v} depth={0} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

function LicenseDetailModal({ item, fromName, toName, userName, productName, onClose }: LicenseDetailModalProps) {
  const { t } = useTranslation();

  const rows = [
    { label: t('history.date'), value: formatTimestamp(item.date) },
    { label: t('licenseMoving.from'), value: fromName },
    { label: t('licenseMoving.to'), value: toName },
    { label: t('licenseMoving.user'), value: userName },
    { label: t('licenseMoving.product'), value: productName },
  ];

  return (
    <Modal isOpen onClose={onClose} title={t('licenseMoving.detailTitle')} size="xl">
      <div className="space-y-4">
        {/* Summary rows */}
        <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
          {rows.map(({ label, value }) => (
            <React.Fragment key={label}>
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="text-gray-900">{value}</span>
            </React.Fragment>
          ))}
        </div>

        {/* License data tree */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {t('licenseMoving.licenseData')}
          </p>
          <div className="bg-gray-50 rounded-md border border-gray-200 p-3 text-xs font-mono overflow-x-auto">
            <JsonTree value={item.license} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LicenseMovingPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const filterValues = useFilterValues();
  const [detailItem, setDetailItem] = useState<LicenseMovingItem | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.history.licenseMoving,
    queryFn: getLicenseMovingHistory,
  });

  const { data: customers = [] } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: getCustomers,
  });

  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployees,
  });

  const { data: products = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: getProducts,
  });

  // Build lookup maps
  const customerMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of Array.isArray(customers) ? customers : []) {
      m.set(c.id, resolveTranslation(c.generalInfo?.name, lang) || c.id);
    }
    return m;
  }, [customers, lang]);

  const employeeMap = useMemo(() => buildUsernameMap(employees), [employees]);

  const productMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of Array.isArray(products) ? products : []) {
      m.set(p.id, resolveTranslation(p.name, lang) || p.id);
    }
    return m;
  }, [products, lang]);

  // Register filter options
  const customerOptions = useMemo(
    () => (Array.isArray(customers) ? customers : []).map((c) => ({
      value: c.id,
      label: resolveTranslation(c.generalInfo?.name, lang) || c.id,
    })),
    [customers, lang],
  );
  const employeeOptions = useMemo(
    () => (Array.isArray(employees) ? employees : []).map((e) => ({ value: e.id, label: e.username })),
    [employees],
  );
  const productOptions = useMemo(
    () => (Array.isArray(products) ? products : []).map((p) => ({
      value: p.id,
      label: resolveTranslation(p.name, lang) || p.id,
    })),
    [products, lang],
  );

  useRegisterFilterOptions('from', customerOptions);
  useRegisterFilterOptions('to', customerOptions);
  useRegisterFilterOptions('user', employeeOptions);
  useRegisterFilterOptions('product', productOptions);

  // Date range pre-filter (dateFrom / dateTo) — handled outside useListOperations
  const dateRangeFiltered = useMemo(
    () => filterByDateRange(data, filterValues),
    [data, filterValues],
  );

  const filterFields = useMemo<FilterField<LicenseMovingItem>[]>(() => [
    { key: 'from',      extract: (item) => item.from,                    matchMode: 'exact' },
    { key: 'to',        extract: (item) => item.to,                      matchMode: 'exact' },
    { key: 'user',      extract: (item) => item.user,                    matchMode: 'exact' },
    { key: 'product',   extract: (item) => item.license?.productId ?? '', matchMode: 'exact' },
    { key: 'licenseId', extract: (item) => item.license?.licenseKey ?? '' },
  ], []);

  const sortFields = useMemo<Record<string, (item: LicenseMovingItem) => string>>(() => ({
    date:    (item) => String(item.date),
    from:    (item) => customerMap.get(item.from) ?? item.from,
    to:      (item) => customerMap.get(item.to) ?? item.to,
    user:    (item) => employeeMap.get(item.user) ?? item.user,
    product: (item) => productMap.get(item.license?.productId) ?? (item.license?.productId ?? ''),
  }), [customerMap, employeeMap, productMap]);

  const listOps = useListOperations<LicenseMovingItem>({
    data: dateRangeFiltered,
    searchFields: (item) => [
      customerMap.get(item.from) ?? item.from,
      customerMap.get(item.to) ?? item.to,
      employeeMap.get(item.user) ?? item.user,
      productMap.get(item.license?.productId) ?? (item.license?.productId ?? ''),
      item.license?.licenseKey ?? '',
    ],
    filterFields,
    externalFilters: filterValues,
    sortFields,
    defaultSort: { key: 'date', direction: 'desc' },
  });

  const columns: TableColumn<LicenseMovingItem>[] = [
    {
      key: 'date',
      header: t('history.date'),
      sortable: true,
      render: (row) => formatTimestamp(row.date),
    },
    {
      key: 'from',
      header: t('licenseMoving.from'),
      sortable: true,
      render: (row) => customerMap.get(row.from) ?? row.from,
    },
    {
      key: 'to',
      header: t('licenseMoving.to'),
      sortable: true,
      render: (row) => customerMap.get(row.to) ?? row.to,
    },
    {
      key: 'user',
      header: t('licenseMoving.user'),
      sortable: true,
      render: (row) => employeeMap.get(row.user) ?? row.user,
    },
    {
      key: 'product',
      header: t('licenseMoving.product'),
      sortable: true,
      render: (row) => productMap.get(row.license?.productId) ?? (row.license?.productId ?? '—'),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <RowActions actions={[
          {
            key: 'view',
            icon: <IconView />,
            title: t('history.details'),
            onClick: () => setDetailItem(row),
          },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">{t('licenseMoving.title')}</h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <Table
            columns={columns}
            data={listOps.items}
            keyExtractor={(row) => `${row.date}-${row.from}-${row.to}-${row.license?.productId}`}
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

      {detailItem && (
        <LicenseDetailModal
          item={detailItem}
          fromName={customerMap.get(detailItem.from) ?? detailItem.from}
          toName={customerMap.get(detailItem.to) ?? detailItem.to}
          userName={employeeMap.get(detailItem.user) ?? detailItem.user}
          productName={productMap.get(detailItem.license?.productId) ?? (detailItem.license?.productId ?? '')}
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  );
}
