import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { renewLicense } from '../../api/customers';
import { queryKeys } from '../../queryKeys';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';

export interface RenewLicenseProduct {
  productId: string;
  name: string;
}

interface RenewLicenseModalProps {
  customerId: string;
  customerName: string;
  products: RenewLicenseProduct[];
  onClose: () => void;
}

export default function RenewLicenseModal({
  customerId,
  customerName,
  products,
  onClose,
}: RenewLicenseModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Set<string>>(
    new Set(products.map((p) => p.productId)),
  );

  const mutation = useMutation({
    mutationFn: () => renewLicense(customerId, Array.from(selected)),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.customers.byId(customerId), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      onClose();
    },
  });

  const toggle = (productId: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(productId)) s.delete(productId);
      else s.add(productId);
      return s;
    });
  };

  const allSelected = products.length > 0 && products.every((p) => selected.has(p.productId));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.productId)));
  };

  return (
    <Modal isOpen onClose={onClose} title={t('customers.renewLicenseTitle')} size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          {customerName}
        </p>

        {products.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('common.noData')}</p>
        ) : (
          <div className="space-y-2">
            <Checkbox
              label={t('common.all')}
              checked={allSelected}
              onChange={toggleAll}
            />
            <div className="border-t border-gray-100 pt-2 space-y-2 max-h-64 overflow-y-auto">
              {products.map((p) => (
                <Checkbox
                  key={p.productId}
                  label={p.name}
                  checked={selected.has(p.productId)}
                  onChange={() => toggle(p.productId)}
                />
              ))}
            </div>
          </div>
        )}

        {mutation.isError && (
          <p className="text-sm text-red-600">{t('common.errorOccurred')}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={selected.size === 0 || mutation.isPending}
          >
            {mutation.isPending ? t('common.loading') : t('customers.renewLicenseConfirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
