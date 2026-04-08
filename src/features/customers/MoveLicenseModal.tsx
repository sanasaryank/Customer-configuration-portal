import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getCustomers, moveLicense } from '../../api/customers';
import type { MoveLicensePayload } from '../../api/customers';
import { queryKeys } from '../../queryKeys';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export interface MoveLicenseProduct {
  productId: string;
  name: string;
}

export interface MoveLicenseLicense {
  licenseName: string;
  products: MoveLicenseProduct[];
}

interface MoveLicenseModalProps {
  srcId: string;
  srcName: string;
  srcLicenses: MoveLicenseLicense[];
  onClose: () => void;
}

export default function MoveLicenseModal({
  srcId,
  srcName,
  srcLicenses,
  onClose,
}: MoveLicenseModalProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();

  // ── Source selection ──────────────────────────────────────────────────────
  const [selectedSrcLicenseName, setSelectedSrcLicenseName] = useState<string | null>(
    srcLicenses.length === 1 ? srcLicenses[0]!.licenseName : null,
  );

  const srcLicenseProducts = useMemo(
    () => srcLicenses.find((l) => l.licenseName === selectedSrcLicenseName)?.products ?? [],
    [srcLicenses, selectedSrcLicenseName],
  );

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    srcLicenses.length === 1 && srcLicenses[0]!.products.length === 1
      ? srcLicenses[0]!.products[0]!.productId
      : null,
  );

  // ── Destination customer ──────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedDstId, setSelectedDstId] = useState<string | null>(null);

  const { data: allCustomers = [], isLoading } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: getCustomers,
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

  // ── Destination license ───────────────────────────────────────────────────
  const [dstLicenseMode, setDstLicenseMode] = useState<'existing' | 'new'>('existing');
  const [selectedExistingLicense, setSelectedExistingLicense] = useState<string | null>(null);
  const [newLicenseName, setNewLicenseName] = useState('');

  const dstCustomer = useMemo(
    () => (Array.isArray(allCustomers) ? allCustomers : []).find((c) => c.id === selectedDstId),
    [allCustomers, selectedDstId],
  );

  const dstExistingLicenseNames = useMemo(
    () => (dstCustomer?.licenseInfo?.licenses ?? []).map((l) => l.name),
    [dstCustomer],
  );

  const newLicenseNameTrimmed = newLicenseName.trim();
  const isNewNameDuplicate =
    dstLicenseMode === 'new' &&
    newLicenseNameTrimmed !== '' &&
    dstExistingLicenseNames.some(
      (n) => n.toLowerCase() === newLicenseNameTrimmed.toLowerCase(),
    );

  const resolvedDstLicense =
    dstLicenseMode === 'existing' ? selectedExistingLicense : newLicenseNameTrimmed;

  const canSubmit =
    !!selectedSrcLicenseName &&
    !!selectedProductId &&
    !!selectedDstId &&
    !!resolvedDstLicense &&
    !isNewNameDuplicate;

  // ── Confirm state ─────────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (payload: MoveLicensePayload) => moveLicense(selectedDstId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all, exact: true });
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!canSubmit) return;
    setConfirmOpen(true);
  };

  const handleConfirmed = () => {
    mutation.mutate({
      source: {
        srcId,
        license: selectedSrcLicenseName!,
        productId: selectedProductId!,
      },
      destination: {
        license: resolvedDstLicense!,
      },
    });
  };

  const handleDstCustomerChange = (id: string) => {
    setSelectedDstId(id);
    setSelectedExistingLicense(null);
    setNewLicenseName('');
    setDstLicenseMode('existing');
  };

  return (
    <>
    <Modal isOpen onClose={onClose} title={t('customers.moveLicenseTitle')} size="lg">
      <div className="space-y-5">
        <p className="text-sm text-gray-600">
          {t('customers.moveLicenseFrom')}: <span className="font-medium">{srcName}</span>
        </p>

        {/* ── Source license ── */}
        {srcLicenses.length > 1 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('customers.moveLicenseSrcLicense')}
            </p>
            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md">
              {srcLicenses.map((lic) => {
                const isSelected = selectedSrcLicenseName === lic.licenseName;
                return (
                  <li
                    key={lic.licenseName}
                    className={`flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-primary-50 transition-colors ${
                      isSelected ? 'bg-primary-100 font-medium text-primary-700' : 'text-gray-800'
                    }`}
                    onClick={() => {
                      setSelectedSrcLicenseName(lic.licenseName);
                      setSelectedProductId(lic.products.length === 1 ? lic.products[0]!.productId : null);
                    }}
                  >
                    <span className="flex-1 truncate">{lic.licenseName || t('customers.license')}</span>
                    <span className="text-xs text-gray-400 ml-2">{lic.products.length} {t('customers.productTypes').toLowerCase()}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── Source product ── */}
        {selectedSrcLicenseName !== null && srcLicenseProducts.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('customers.moveLicenseProduct')}
            </p>
            {srcLicenseProducts.length === 1 ? (
              <p className="text-sm text-gray-700 px-1">
                {srcLicenseProducts[0]!.name || srcLicenseProducts[0]!.productId}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md">
                {srcLicenseProducts.map((p) => {
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
        )}

        {/* ── Destination customer ── */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t('customers.moveLicenseDstCustomer')}
          </p>
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleDstCustomerChange('');
            }}
          />
          {isLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">{t('common.noData')}</p>
          ) : (
            <ul className="max-h-44 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-md">
              {candidates.map((c) => {
                const name = resolveTranslation(c.generalInfo?.name, lang);
                const isSelected = selectedDstId === c.id;
                return (
                  <li
                    key={c.id}
                    className={`flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-primary-50 transition-colors ${
                      isSelected ? 'bg-primary-100 font-medium text-primary-700' : 'text-gray-800'
                    }`}
                    onClick={() => handleDstCustomerChange(c.id)}
                  >
                    <span className="flex-1 truncate">{name || c.id}</span>
                    <span className="text-xs text-gray-400 ml-2 shrink-0">{c.id}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Destination license (shown after dst customer is selected) ── */}
        {selectedDstId && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('customers.moveLicenseDstLicense')}
            </p>

            {/* Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setDstLicenseMode('existing'); setNewLicenseName(''); }}
                className={`text-xs px-3 py-1 rounded border transition-colors ${
                  dstLicenseMode === 'existing'
                    ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {t('customers.moveLicenseExisting')}
              </button>
              <button
                type="button"
                onClick={() => { setDstLicenseMode('new'); setSelectedExistingLicense(null); }}
                className={`text-xs px-3 py-1 rounded border transition-colors ${
                  dstLicenseMode === 'new'
                    ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {t('customers.moveLicenseNew')}
              </button>
            </div>

            {dstLicenseMode === 'existing' && (
              dstExistingLicenseNames.length === 0 ? (
                <p className="text-sm text-gray-400 py-1">{t('common.noData')}</p>
              ) : (
                <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md">
                  {dstExistingLicenseNames.map((name) => {
                    const isSelected = selectedExistingLicense === name;
                    return (
                      <li
                        key={name}
                        className={`flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-primary-50 transition-colors ${
                          isSelected ? 'bg-primary-100 font-medium text-primary-700' : 'text-gray-800'
                        }`}
                        onClick={() => setSelectedExistingLicense(name)}
                      >
                        {name}
                      </li>
                    );
                  })}
                </ul>
              )
            )}

            {dstLicenseMode === 'new' && (
              <Input
                placeholder={t('customers.licenseName')}
                value={newLicenseName}
                onChange={(e) => setNewLicenseName(e.target.value)}
                error={isNewNameDuplicate ? t('customers.licenseNameDuplicate') : undefined}
              />
            )}
          </div>
        )}

        {mutation.isError && <ErrorBanner message={mutation.error?.message || t('common.errorOccurred')} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} loading={mutation.isPending}>
            {t('customers.moveLicenseConfirm')}
          </Button>
        </div>
      </div>
    </Modal>

    <ConfirmDialog
      isOpen={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      onConfirm={handleConfirmed}
      title={t('customers.moveLicenseTitle')}
      message={t('customers.moveLicenseConfirmMessage')}
      confirmLabel={t('customers.moveLicenseConfirm')}
      loading={mutation.isPending}
    />
    </>
  );
}
