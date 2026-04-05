import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getDictionary,
  updateDictionaryItem,
  getDictionaryItem,
} from '../../api/dictionaries';
import { queryKeys } from '../../queryKeys';
import type { DictionaryKey, DictionaryListItem } from '../../types/dictionary';
import { useAuth } from '../../providers/AuthProvider';
import { useListOperations } from '../../hooks/useListOperations';
import type { FilterField } from '../../hooks/useListOperations';
import { useFilterValues, useRegisterFilterOptions } from '../../providers/FilterProvider';
import { resolveTranslation } from '../../utils/translation';
import { extractTranslation } from '../../utils/translation';
import { buildLookupMap } from '../../utils/lookup';
import { Table } from '../../components/ui/Table';
import type { TableColumn } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { RowActions, IconEdit, IconLock, IconUnlock, IconHistory } from '../../components/ui/RowActions';
import DictionaryModal from './DictionaryModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const DICT_TITLE_KEYS: Record<DictionaryKey, string> = {
  integrationTypes: 'nav.integrationTypes',
  restaurantTypes: 'nav.restaurantTypes',
  hotelTypes: 'nav.hotelTypes',
  menuTypes: 'nav.menuTypes',
  priceSegments: 'nav.priceSegments',
  productGroups: 'nav.productGroups',
  customerGroups: 'nav.customerGroups',
  customerStatus: 'nav.customerStatus',
  licenseTypes: 'nav.licenseTypes',
  countries: 'nav.countries',
  cities: 'nav.cities',
  districts: 'nav.districts',
};

/** Config for geo entities that have a required parent foreign key */
interface GeoParentConfig {
  parentKey: DictionaryKey;
  parentField: string;
  parentLabelKey: string;
  columnLabelKey: string;
}

const GEO_PARENT_CONFIG: Partial<Record<DictionaryKey, GeoParentConfig>> = {
  cities: {
    parentKey: 'countries',
    parentField: 'countryId',
    parentLabelKey: 'cities.country',
    columnLabelKey: 'cities.country',
  },
  districts: {
    parentKey: 'cities',
    parentField: 'cityId',
    parentLabelKey: 'districts.city',
    columnLabelKey: 'districts.city',
  },
};

interface DictionaryPageProps {
  dictKey: DictionaryKey;
}

export default function DictionaryPage({ dictKey }: DictionaryPageProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(
    undefined,
  );
  const filterValues = useFilterValues();
  const geoConfig = GEO_PARENT_CONFIG[dictKey];

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.dict(dictKey),
    queryFn: () => getDictionary(dictKey),
  });

  // Load parent list for geo entities that need parent column
  const { data: parentData = [] } = useQuery({
    queryKey: queryKeys.dict(geoConfig?.parentKey ?? 'countries'),
    queryFn: () => getDictionary(geoConfig!.parentKey),
    enabled: !!geoConfig,
  });
  const parentMap = React.useMemo(
    () => buildLookupMap(parentData, lang),
    [parentData, lang],
  );

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

  // Register parent options for geo select dropdowns (countryId / cityId)
  const parentOptions = useMemo(
    () => parentData.map((p) => ({ value: p.id, label: resolveTranslation(p.name, lang) })),
    [parentData, lang],
  );
  // Hook must always be called; use parentField key or empty string for non-geo
  const parentFilterKey = geoConfig?.parentField ?? '';
  useRegisterFilterOptions(parentFilterKey, parentOptions);

  const filterFields = useMemo<FilterField<DictionaryListItem>[]>(() => {
    const fields: FilterField<DictionaryListItem>[] = [
      { key: 'name',      extract: (item) => extractTranslation(item.name, lang) },
      { key: 'isBlocked', extract: (item) => item.isBlocked ? 'blocked' : 'active', matchMode: 'exact' },
    ];
    if (geoConfig) {
      fields.unshift({
        key: geoConfig.parentField,
        extract: (item) => {
          const parentId = (item as unknown as Record<string, unknown>)[geoConfig.parentField];
          return typeof parentId === 'string' ? parentId : '';
        },
        matchMode: 'exact',
      });
    }
    return fields;
  }, [lang, geoConfig]);

  const sortFields = useMemo<Record<string, (item: DictionaryListItem) => string>>(() => {
    const fields: Record<string, (item: DictionaryListItem) => string> = {
      id: (item) => item.id,
      name: (item) => resolveTranslation(item.name, lang),
      isBlocked: (item) => String(item.isBlocked),
    };
    if (geoConfig) {
      fields[geoConfig.parentField] = (item) => {
        const parentId = (item as unknown as Record<string, unknown>)[geoConfig.parentField];
        return typeof parentId === 'string' ? (parentMap.get(parentId) ?? '') : '';
      };
    }
    return fields;
  }, [lang, geoConfig, parentMap]);

  const listOps = useListOperations<DictionaryListItem>({
    data,
    searchFields: (item) => {
      const base = [resolveTranslation(item.name, lang)];
      if (geoConfig) {
        const parentId = (item as unknown as Record<string, unknown>)[geoConfig.parentField];
        if (typeof parentId === 'string') {
          base.push(parentMap.get(parentId) ?? '');
        }
      }
      return base;
    },
    filterFields,
    externalFilters: filterValues,
    sortFields,
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

  const columns: TableColumn<DictionaryListItem>[] = [
    { key: 'id', header: t('common.id'), sortable: true, render: (row) => row.id },
    ...(geoConfig ? [{
      key: geoConfig.parentField,
      header: t(geoConfig.columnLabelKey),
      sortable: true,
      render: (row: DictionaryListItem) => {
        const parentId = (row as unknown as Record<string, unknown>)[geoConfig.parentField];
        return typeof parentId === 'string' ? (parentMap.get(parentId) ?? parentId) : '—';
      },
    }] : []),
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
          parentKey={geoConfig?.parentKey}
          parentField={geoConfig?.parentField}
          parentLabel={geoConfig?.parentLabelKey}
        />
      )}
    </div>
  );
}
