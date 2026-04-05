import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getCustomers, moveLicense } from '../../api/customers';
import { queryKeys } from '../../queryKeys';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

interface MoveLicenseModalProps {
  srcId: string;
  srcName: string;
  onClose: () => void;
}

export default function MoveLicenseModal({
  srcId,
  srcName,
  onClose,
}: MoveLicenseModalProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: allCustomers = [], isLoading } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: getCustomers,
  });

  const mutation = useMutation({
    mutationFn: (dstId: string) => moveLicense(srcId, dstId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      onClose();
    },
  });

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (Array.isArray(allCustomers) ? allCustomers : [])
      .filter((c) => c.id !== srcId)
      .filter((c) => {
        if (!q) return true;
        return resolveTranslation(c.generalInfo?.name, lang).toLowerCase().includes(q);
      });
  }, [allCustomers, srcId, search, lang]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t('customers.moveLicenseTitle')}
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          {t('customers.moveLicenseFrom')}: <span className="font-medium">{srcName}</span>
        </p>

        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedId(null);
          }}
          autoFocus
        />

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('common.noData')}</p>
        ) : (
          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-md">
            {candidates.map((c) => {
              const name = resolveTranslation(c.generalInfo?.name, lang);
              const isSelected = selectedId === c.id;
              return (
                <li
                  key={c.id}
                  className={`flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-primary-50 transition-colors ${
                    isSelected ? 'bg-primary-100 font-medium text-primary-700' : 'text-gray-800'
                  }`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <span className="flex-1 truncate">{name || c.id}</span>
                  <span className="text-xs text-gray-400 ml-2 shrink-0">{c.id}</span>
                </li>
              );
            })}
          </ul>
        )}

        {mutation.isError && (
          <p className="text-sm text-red-600">{t('common.errorOccurred')}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => selectedId && mutation.mutate(selectedId)}
            disabled={!selectedId || mutation.isPending}
          >
            {mutation.isPending ? t('common.loading') : t('customers.moveLicenseConfirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
