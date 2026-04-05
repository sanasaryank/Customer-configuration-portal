import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { renewLicense } from '../../api/customers';
import { getWorkingDays } from '../../api/workingDays';
import { queryKeys } from '../../queryKeys';
import { unixToDateInput, dateInputToUnix } from '../../utils/timestamp';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';

export interface RenewLicenseProduct {
  productId: string;
  name: string;
  licenseTypeId: string;
  endDate: number;
}

interface RenewLicenseModalProps {
  customerId: string;
  customerName: string;
  products: RenewLicenseProduct[];
  countryId: string;
  onClose: () => void;
}

// ── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isWorkingDay(d: Date, holidays: Set<string>): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  return !holidays.has(formatDate(d));
}

/**
 * Starting from the 15th of the target month, find the first Tue/Wed/Thu
 * where the next calendar day is also a working day.
 */
function calcAutoEndDate(type: 'monthly' | 'yearly', holidays: Set<string>): string {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(1); // prevent month-rollover before advancing
  if (type === 'monthly') {
    base.setMonth(base.getMonth() + 1);
  } else {
    base.setFullYear(base.getFullYear() + 1);
  }
  base.setDate(15);

  const candidate = new Date(base);
  for (let i = 0; i < 60; i++) {
    const dow = candidate.getDay(); // 2=Tue 3=Wed 4=Thu
    if (dow === 2 || dow === 3 || dow === 4) {
      const next = new Date(candidate);
      next.setDate(next.getDate() + 1);
      if (isWorkingDay(next, holidays)) {
        return formatDate(candidate);
      }
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  return formatDate(base);
}

export default function RenewLicenseModal({
  customerId,
  customerName,
  products,
  countryId,
  onClose,
}: RenewLicenseModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Filter out lifetime products
  const eligibleProducts = useMemo(
    () => products.filter((p) => p.licenseTypeId !== 'lifetime'),
    [products],
  );

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(products.filter((p) => p.licenseTypeId !== 'lifetime').map((p) => p.productId)),
  );

  const [endDates, setEndDates] = useState<Record<string, string>>(
    () => Object.fromEntries(products.filter((p) => p.licenseTypeId !== 'lifetime').map((p) => [p.productId, unixToDateInput(p.endDate)])),
  );

  const { data: holidayList = [] } = useQuery({
    queryKey: queryKeys.workingDays(countryId),
    queryFn: () => getWorkingDays(countryId),
    enabled: !!countryId,
  });

  const holidays = useMemo(() => new Set(holidayList), [holidayList]);

  const mutation = useMutation({
    mutationFn: () =>
      renewLicense(
        customerId,
        Array.from(selected).map((productId) => ({
          productId,
          endDate: dateInputToUnix(endDates[productId] ?? ''),
        })),
      ),
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

  const allSelected =
    eligibleProducts.length > 0 &&
    eligibleProducts.every((p) => selected.has(p.productId));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(eligibleProducts.map((p) => p.productId)));
  };

  const handleAutoUpdate = (p: RenewLicenseProduct) => {
    const type = p.licenseTypeId as 'monthly' | 'yearly';
    setEndDates((prev) => ({ ...prev, [p.productId]: calcAutoEndDate(type, holidays) }));
  };

  return (
    <Modal isOpen onClose={onClose} title={t('customers.renewLicenseTitle')} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          {customerName}
        </p>

        {eligibleProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('common.noData')}</p>
        ) : (
          <div className="space-y-2">
            <Checkbox
              label={t('common.all')}
              checked={allSelected}
              onChange={toggleAll}
            />
            <div className="border-t border-gray-100 pt-2 pb-1 space-y-3 max-h-80 overflow-y-auto overflow-x-visible px-1">
              {eligibleProducts.map((p) => {
                const showAutoUpdate = p.licenseTypeId === 'monthly' || p.licenseTypeId === 'yearly';
                return (
                  <div key={p.productId} className="space-y-1">
                    <Checkbox
                      label={p.name}
                      checked={selected.has(p.productId)}
                      onChange={() => toggle(p.productId)}
                    />
                    <div className="flex items-center gap-2 pl-6 pr-1">
                      <input
                        type="date"
                        className="form-input text-sm flex-1 border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                        value={endDates[p.productId] ?? ''}
                        onChange={(e) =>
                          setEndDates((prev) => ({ ...prev, [p.productId]: e.target.value }))
                        }
                        disabled={!selected.has(p.productId)}
                      />
                      {showAutoUpdate && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="shrink-0"
                          disabled={!selected.has(p.productId)}
                          onClick={() => handleAutoUpdate(p)}
                        >
                          {t('common.update')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
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
