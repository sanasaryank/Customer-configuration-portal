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

export interface MoveLicenseProduct {
  productId: string;
  name: string;
}

interface MoveLicenseModalProps {
  srcId: string;
  srcName: string;
  srcProducts: MoveLicenseProduct[];
  onClose: () => void;
}

export default function MoveLicenseModal({
  srcId,
  srcName,
  srcProducts,
  onClose,
}: MoveLicenseModalProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    srcProducts.length === 1 ? srcProducts[0]!.productId : null,
  );
  const [selectedDstId, setSelectedDstId] = useState<string | null>(null);

  const { data: allCustomers = [], isLoading } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: getCustomers,
  });

  const mutation = useMutation({
    mutationFn: ({ dstId, productId }: { dstId: string; productId: string }) =>
      moveLicense(srcId, dstId, productId),
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

  const canSubmit = !!selectedProductId && !!selectedDstId && !mutation.isPending;

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

        {/* Product selection */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t('customers.moveLicenseProduct')}
          </p>
          {srcProducts.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">{t('common.noData')}</p>
          ) : (
            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md">
              {srcProducts.map((p) => {
                const isSelected = selectedProductId === p.productId;
                return (
                  <li
                    key={p.productId}
                    className={`flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-primary-50 transition-colors ${
                      isSelected ? 'bg-primary-100 font-medium text-primary-700' : 'text-gray-800'
                    }`}
                    onClick={() => setSelectedProductId(p.productId)}
                  >
                    <span className="flex-1 truncate">{p.name || p.productId}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Destination customer selection */}
        <div className="space-y-1">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedDstId(null);
            }}
          />

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">{t('common.noData')}</p>
          ) : (
            <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-md">
              {candidates.map((c) => {
                const name = resolveTranslation(c.generalInfo?.name, lang);
                const isSelected = selectedDstId === c.id;
                return (
                  <li
                    key={c.id}
                    className={`flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-primary-50 transition-colors ${
                      isSelected ? 'bg-primary-100 font-medium text-primary-700' : 'text-gray-800'
                    }`}
                    onClick={() => setSelectedDstId(c.id)}
                  >
                    <span className="flex-1 truncate">{name || c.id}</span>
                    <span className="text-xs text-gray-400 ml-2 shrink-0">{c.id}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600">{t('common.errorOccurred')}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() =>
              canSubmit && mutation.mutate({ dstId: selectedDstId!, productId: selectedProductId! })
            }
            disabled={!canSubmit}
          >
            {mutation.isPending ? t('common.loading') : t('customers.moveLicenseConfirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
