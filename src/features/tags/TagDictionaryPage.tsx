import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getTags, getTagItem, updateTag } from '../../api/tags';
import { queryKeys } from '../../queryKeys';
import type { TagDictionaryKey, TagListItem } from '../../types/tag';
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
import TagDictionaryModal from './TagDictionaryModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const TAG_TITLE_KEYS: Record<TagDictionaryKey, string> = {
  customerTags: 'nav.customerTags',
  productTags: 'nav.productTags',
};

interface TagDictionaryPageProps {
  tagKey: TagDictionaryKey;
}

export default function TagDictionaryPage({ tagKey }: TagDictionaryPageProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const navigate = useNavigate();
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(
    undefined,
  );
  const filterValues = useFilterValues();

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.tag(tagKey),
    queryFn: () => getTags(tagKey),
  });

  const blockMutation = useBlockToggle({
    getItem: (id: string) => getTagItem(tagKey, id),
    updateItem: (id: string, payload) => updateTag(tagKey, id, payload),
    listQueryKey: queryKeys.tag(tagKey),
  });

  const filterFields = useMemo<FilterField<TagListItem>[]>(() => [
    { key: 'name', extract: (item) => extractTranslation(item.name, lang) },
    { key: 'isBlocked', extract: (item) => item.isBlocked ? 'blocked' : 'active', matchMode: 'exact' },
  ], [lang]);

  const sortFields = useMemo<Record<string, (item: TagListItem) => string>>(() => ({
    id: (item) => item.id,
    name: (item) => resolveTranslation(item.name, lang),
    itemCount: (item) => String(item.items?.length ?? 0),
    isBlocked: (item) => String(item.isBlocked),
  }), [lang]);

  const listOps = useListOperations<TagListItem>({
    data,
    searchFields: (item) => [resolveTranslation(item.name, lang), item.id],
    filterFields,
    externalFilters: filterValues,
    sortFields,
  });

  const columns: TableColumn<TagListItem>[] = [
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      render: (row) => resolveTranslation(row.name, lang),
    },
    {
      key: 'itemCount',
      header: t('tags.itemCount'),
      sortable: true,
      render: (row) => String(row.items?.length ?? 0),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <RowActions actions={[
          { key: 'edit', icon: <IconEdit />, title: t('common.edit'), onClick: () => setModalEditId(row.id) },
          { key: 'block', icon: row.isBlocked ? <IconLock /> : <IconUnlock />, title: row.isBlocked ? t('common.unblock') : t('common.block'), variant: row.isBlocked ? 'warning' : 'default', onClick: () => blockMutation.mutate({ id: row.id, isBlocked: !row.isBlocked }) },
          { key: 'history', icon: <IconHistory />, title: t('common.history'), onClick: () => navigate(`${ROUTES.HISTORY_ACTIONS}?objectId=${row.id}`) },
        ]} />
      ),
    },
  ];

  const titleKey = TAG_TITLE_KEYS[tagKey];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t(titleKey)}</h1>
        <Button onClick={() => setModalEditId(null)}>
          {t('common.create')}
        </Button>
      </div>

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
        <TagDictionaryModal
          tagKey={tagKey}
          editId={modalEditId}
          onClose={() => setModalEditId(undefined)}
          existingTags={data}
        />
      )}
    </div>
  );
}
