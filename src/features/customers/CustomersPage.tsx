import React, { useState, useMemo } from 'react';
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
import { RowActions, IconEdit, IconLock, IconUnlock, IconHistory, IconMoveLicense, IconRenewLicense, IconShare } from '../../components/ui/RowActions';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import CustomerModal from './CustomerModal';
import MoveLicenseModal from './MoveLicenseModal';
import type { MoveLicenseLicense } from './MoveLicenseModal';
import RenewLicenseModal from './RenewLicenseModal';
import type { RenewLicenseProduct } from './RenewLicenseModal';
import ShareLicenseModal from './ShareLicenseModal';
import type { ShareLicenseSource } from './ShareLicenseModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { formatTimestamp } from '../../utils/timestamp';

/** Flatten all products across all licenses for filtering/sorting/display. */
function getLicenseProducts(licenseInfo: CustomerListItem['licenseInfo'] | undefined) {
  return (licenseInfo?.licenses ?? []).flatMap((l) => l.products ?? []);
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(undefined);
  const [moveLicenseSrc, setMoveLicenseSrc] = useState<{ id: string; name: string; licenses: MoveLicenseLicense[] } | null>(null);
  const [renewLicenseSrc, setRenewLicenseSrc] = useState<{ id: string; name: string; products: RenewLicenseProduct[]; countryId: string } | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<{ id: string; name: string; isBlocked: boolean } | null>(null);
  const [shareLicenseSrc, setShareLicenseSrc] = useState<ShareLicenseSource | null>(null);
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
  const { data: licenseTypeDictItems = [] } = useQuery({
    queryKey: queryKeys.dict('licenseTypes'),
    queryFn: () => getDictionary('licenseTypes'),
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
  const licenseTypeOptions = useMemo(
    () => licenseTypeDictItems.map((lt) => ({ value: lt.id, label: resolveTranslation(lt.name, lang) })),
    [licenseTypeDictItems, lang],
  );
  useRegisterFilterOptions('group', groupOptions);
  useRegisterFilterOptions('productTypes', productTypeOptions);
  useRegisterFilterOptions('licenseType', licenseTypeOptions);
  useRegisterFilterOptions('status', statusOptions);

  const filterFields = useMemo<FilterField<CustomerListItem>[]>(() => [
    { key: 'name',         extract: (item) => extractTranslation(item.generalInfo?.name, lang) },
    { key: 'group',        extract: (item) => item.generalInfo?.groupId ?? '',          matchMode: 'exact' },
    { key: 'productTypes', extract: (item) => getLicenseProducts(item.licenseInfo).map((p) => p.productId).join(','), matchMode: 'array' },
    { key: 'licenseMode',  extract: (item) => getLicenseProducts(item.licenseInfo).map((p) => p.licenseModeId).join(','), matchMode: 'array' },
    { key: 'licenseType',  extract: (item) => getLicenseProducts(item.licenseInfo).map((p) => p.licenseTypeId).join(','), matchMode: 'array' },
    { key: 'status',       extract: (item) => item.generalInfo?.statusId ?? '',         matchMode: 'exact' },
    { key: 'isBlocked',    extract: (item) => item.generalInfo?.isBlocked ? 'blocked' : 'active',   matchMode: 'exact' },
  ], [lang]);

  const sortFields = useMemo<Record<string, (item: CustomerListItem) => string>>(() => ({
    id: (item) => item.id,
    name: (item) => resolveTranslation(item.generalInfo?.name, lang),
    group: (item) => resolveId(item.generalInfo?.groupId, groupMap),
    productTypes: (item) => resolveIds(getLicenseProducts(item.licenseInfo).map((p) => p.productId), productMap),
    endDate: (item) => {
      const dates = getLicenseProducts(item.licenseInfo)
        .map((p) => p.endDate)
        .filter((d): d is number => typeof d === 'number' && d > 0);
      return dates.length === 0 ? '0' : String(Math.min(...dates));
    },
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

  // ── Product chip helpers ──────────────────────────────────────────────────

  // 10 visually distinct color pairs [bg, text] using Tailwind classes
  const CHIP_COLORS = [
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-emerald-100 text-emerald-800',
    'bg-orange-100 text-orange-800',
    'bg-rose-100 text-rose-800',
    'bg-cyan-100 text-cyan-800',
    'bg-yellow-100 text-yellow-800',
    'bg-fuchsia-100 text-fuchsia-800',
    'bg-teal-100 text-teal-800',
    'bg-indigo-100 text-indigo-800',
  ] as const;

  // Deterministic hash of product id -> stable color index
  function chipColorClass(productId: string): string {
    let h = 0;
    for (let i = 0; i < productId.length; i++) h = (Math.imul(31, h) + productId.charCodeAt(i)) | 0;
    return CHIP_COLORS[Math.abs(h) % CHIP_COLORS.length]!;
  }

  // Build a stable 2-3 letter abbreviation for every product, guaranteed unique within the set.
  // Always derived from Latin-script names (ENG first) so abbreviations are legible in any UI language.
  const productAbbrMap = React.useMemo((): Map<string, string> => {
    const result = new Map<string, string>();
    const used = new Map<string, string>(); // abbr -> first productId that claimed it

    // Pick a Latin-script source name: ENG > RUS > ARM, whichever has Latin chars first
    const latinName = (id: string): string => {
      const p = (Array.isArray(products) ? products : []).find((x) => x.id === id);
      if (!p) return id;
      for (const key of ['ENG', 'RUS', 'ARM'] as const) {
        const v = p.name[key];
        if (v && /[A-Za-z]/.test(v)) return v;
      }
      // No Latin translation — fall back to the first non-empty translation
      return p.name.ENG || p.name.RUS || p.name.ARM || id;
    };

    const tryAbbr = (id: string, candidate: string) => {
      const upper = candidate.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
      if (!upper) return null;
      if (!used.has(upper)) {
        used.set(upper, id);
        result.set(id, upper);
        return upper;
      }
      return null;
    };

    const ids = (Array.isArray(products) ? products : []).map((p) => p.id);

    // First pass: initials from words (e.g. "Point Of Sale" -> "POS")
    for (const id of ids) {
      const name = latinName(id);
      const words = name.trim().split(/\s+/);
      const initials = words.map((w) => w[0] ?? '').join('').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (initials.length >= 2) {
        tryAbbr(id, initials.slice(0, 3));
      }
    }

    // Second pass: first 3 chars of Latin name for anything not yet assigned
    for (const id of ids) {
      if (result.has(id)) continue;
      tryAbbr(id, latinName(id).slice(0, 3));
    }

    // Third pass: first chars of id as last resort
    for (const id of ids) {
      if (result.has(id)) continue;
      for (let len = 2; len <= id.length; len++) {
        const candidate = id.slice(0, len).toUpperCase();
        if (!used.has(candidate)) {
          used.set(candidate, id);
          result.set(id, candidate);
          break;
        }
      }
      if (!result.has(id)) result.set(id, id.slice(0, 3).toUpperCase());
    }

    return result;
  }, [products]);

  const NOW_S = Math.floor(Date.now() / 1000);
  const SEVEN_DAYS_S = 7 * 24 * 60 * 60;

  const columns: TableColumn<CustomerListItem>[] = [
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      className: 'max-w-[180px]',
      render: (row) => (
        <span className="block truncate max-w-[180px]" title={resolveTranslation(row.generalInfo?.name, lang)}>
          {resolveTranslation(row.generalInfo?.name, lang)}
        </span>
      ),
    },
    {
      key: 'group',
      header: t('customers.groupId'),
      sortable: true,
      className: 'max-w-[140px]',
      render: (row) => (
        <span className="block truncate max-w-[140px]" title={resolveId(row.generalInfo?.groupId, groupMap)}>
          {resolveId(row.generalInfo?.groupId, groupMap)}
        </span>
      ),
    },
    {
      key: 'productTypes',
      header: t('customers.productTypes'),
      sortable: true,
      className: 'max-w-[160px]',
      render: (row) => {
        const ids = getLicenseProducts(row.licenseInfo).map((p) => p.productId);
        if (ids.length === 0) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[160px]">
            {ids.map((id) => (
              <span
                key={id}
                title={productMap.get(id) ?? id}
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold tracking-wide ${chipColorClass(id)}`}
              >
                {productAbbrMap.get(id) ?? id.slice(0, 3).toUpperCase()}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'licenseTypes',
      header: t('customers.licenseType'),
      className: 'max-w-[120px]',
      render: (row) => {
        const ids = [...new Set(getLicenseProducts(row.licenseInfo).map((p) => p.licenseTypeId).filter(Boolean))];
        if (ids.length === 0) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[120px]">
            {ids.map((id) => {
              const dictItem = licenseTypeDictItems.find((x) => x.id === id);
              const fullName = dictItem ? resolveTranslation(dictItem.name, lang) : id;
              const words = fullName.trim().split(/\s+/);
              const abbr = words.length >= 2
                ? words.map((w) => w[0] ?? '').join('').slice(0, 3).toUpperCase()
                : fullName.slice(0, 3).toUpperCase();
              return (
                <span
                  key={id}
                  title={fullName}
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold tracking-wide ${chipColorClass(id)}`}
                >
                  {abbr}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'endDate',
      header: t('customers.endDate'),
      sortable: true,
      render: (row) => {
        const dates = getLicenseProducts(row.licenseInfo)
          .map((p) => p.endDate)
          .filter((d): d is number => typeof d === 'number' && d > 0);
        if (dates.length === 0) return <span className="text-gray-400">—</span>;
        const min = Math.min(...dates);
        let cls = 'text-green-700 font-medium';
        if (min < NOW_S) cls = 'text-red-900 font-semibold';
        else if (min < NOW_S + SEVEN_DAYS_S) cls = 'text-red-600 font-medium';
        return <span className={cls}>{formatTimestamp(min)}</span>;
      },
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
          { key: 'block',         icon: row.generalInfo?.isBlocked ? <IconLock /> : <IconUnlock />, title: row.generalInfo?.isBlocked ? t('common.unblock') : t('common.block'), variant: row.generalInfo?.isBlocked ? 'warning' as const : 'default' as const, onClick: () => setConfirmBlock({ id: row.id, name: resolveTranslation(row.generalInfo?.name, lang), isBlocked: !!row.generalInfo?.isBlocked }) },
          { key: 'renewLicense',  icon: <IconRenewLicense />,                                       title: t('customers.renewLicense'),   onClick: () => setRenewLicenseSrc({ id: row.id, name: resolveTranslation(row.generalInfo?.name, lang), countryId: row.contactInfo?.geo?.countryId ?? '', products: getLicenseProducts(row.licenseInfo).map((p) => ({ productId: p.productId, name: productMap.get(p.productId) || p.productId, licenseModeId: p.licenseModeId ?? '', endDate: p.endDate ?? 0, track: p.track ?? false })) }) },
          { key: 'moveLicense',   icon: <IconMoveLicense />,  title: t('customers.moveLicense'),    onClick: () => setMoveLicenseSrc({ id: row.id, name: resolveTranslation(row.generalInfo?.name, lang), licenses: (row.licenseInfo?.licenses ?? []).map((lic) => ({ licenseName: lic.name, products: lic.products.map((p) => ({ productId: p.productId, name: productMap.get(p.productId) || p.productId })) })) }) },
          { key: 'shareLicense',  icon: <IconShare />,        title: t('customers.shareLicense'),   onClick: () => setShareLicenseSrc({ id: row.id, name: resolveTranslation(row.generalInfo?.name, lang), email: row.contactInfo?.email ?? '' }) },
          { key: 'history',       icon: <IconHistory />,      title: t('common.history'),           onClick: () => navigate(`${ROUTES.HISTORY_ACTIONS}?objectId=${row.id}`) },
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
        <CustomerModal editId={modalEditId} onClose={() => setModalEditId(undefined)} />
      )}

      {moveLicenseSrc !== null && (
        <MoveLicenseModal
          srcId={moveLicenseSrc.id}
          srcName={moveLicenseSrc.name}
          srcLicenses={moveLicenseSrc.licenses}
          onClose={() => setMoveLicenseSrc(null)}
        />
      )}

      {renewLicenseSrc !== null && (
        <RenewLicenseModal
          customerId={renewLicenseSrc.id}
          customerName={renewLicenseSrc.name}
          products={renewLicenseSrc.products}
          countryId={renewLicenseSrc.countryId}
          onClose={() => setRenewLicenseSrc(null)}
        />
      )}

      {shareLicenseSrc !== null && (
        <ShareLicenseModal
          source={shareLicenseSrc}
          onClose={() => setShareLicenseSrc(null)}
        />
      )}

      {confirmBlock !== null && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmBlock(null)}
          onConfirm={() => {
            blockMutation.mutate({ id: confirmBlock.id, isBlocked: !confirmBlock.isBlocked });
            setConfirmBlock(null);
          }}
          title={t(confirmBlock.isBlocked ? 'common.unblockTitle' : 'common.blockTitle')}
          message={t(confirmBlock.isBlocked ? 'common.confirmUnblock' : 'common.confirmBlock', { name: confirmBlock.name })}
          confirmLabel={t(confirmBlock.isBlocked ? 'common.unblock' : 'common.block')}
          loading={blockMutation.isPending}
        />
      )}
    </div>
  );
}
