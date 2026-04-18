import React from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../../api/products';
import { getDictionary } from '../../../api/dictionaries';
import { queryKeys } from '../../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';
import type { CustomerFormValues } from '../../../types/customer';
import type { LicenseTemplateField } from '../../../types/product';
import { LICENSE_MODE_IDS } from '../../../constants/licenseTypes';
import { resolveTranslation } from '../../../utils/translation';
import { Input } from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { DictionarySelect } from '../../../components/form/DictionarySelect';
import { PasswordField } from '../../../components/form/PasswordField';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { CopyableInput } from '../../../components/ui/CopyableInput';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';

function LicenseFieldInput({
  templateField,
  fieldPath,
}: {
  templateField: LicenseTemplateField;
  fieldPath: string;
}) {
  const { register } = useFormContext();
  const inputProps: Record<string, string | boolean> = {};

  switch (templateField.kind) {
    case 'number':
      inputProps.type = 'number';
      break;
    case 'date':
      inputProps.type = 'date';
      break;
    case 'time':
      inputProps.type = 'time';
      break;
    case 'datetime':
      inputProps.type = 'datetime-local';
      break;
    case 'boolean':
      return <Checkbox label={templateField.name} {...register(fieldPath)} />;
    default:
      inputProps.type = 'text';
  }

  return (
    <Input
      label={templateField.name}
      required={templateField.required}
      {...inputProps}
      {...register(fieldPath)}
    />
  );
}

/** Reusable expand/collapse block used for product items and connectionInfo. */
function CollapsibleBlock({
  expanded,
  onToggle,
  title,
  headerRight,
  children,
  className,
  headerClassName,
}: {
  expanded: boolean;
  onToggle: () => void;
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}) {
  return (
    <div className={`border rounded-md overflow-hidden ${className ?? 'border-gray-200'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${headerClassName ?? 'bg-gray-50'}`}>
        <button
          type="button"
          className="flex items-center gap-2 flex-1 text-left text-sm font-medium text-gray-700 hover:text-gray-900"
          onClick={onToggle}
        >
          <span className={`text-xs inline-block transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          {title}
        </button>
        {headerRight}
      </div>
      {expanded && (
        <div className="px-3 py-3 space-y-3 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

/** Connection fields rendered inside each license block. */
function LicenseConnectionFields({
  licIndex,
  isEdit,
  otherLicenses,
}: {
  licIndex: number;
  isEdit: boolean;
  otherLicenses: { licIndex: number; label: string }[];
}) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, setValue, getValues } = useFormContext() as any;
  const { data: integrationTypes = [] } = useQuery({
    queryKey: queryKeys.dict('integrationTypes'),
    queryFn: () => getDictionary('integrationTypes'),
  });

  const [copySelectValue, setCopySelectValue] = React.useState('');

  const handleCopyFrom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const srcLic = Number(e.target.value);
    if (Number.isNaN(srcLic)) return;
    const src = getValues(`licenseInfo.licenses.${srcLic}.connectionInfo`);
    setValue(`licenseInfo.licenses.${licIndex}.connectionInfo`, {
      ...src,
      serverPassword: '',
      password: '',
    });
    setCopySelectValue('');
  };

  const base = `licenseInfo.licenses.${licIndex}.connectionInfo`;
  const hint = isEdit ? t('customers.passwordHint') : undefined;

  const [expanded, setExpanded] = React.useState(false);

  const copyDropdown = otherLicenses.length > 0 ? (
    <select
      className="text-xs form-select py-1 pr-7 text-gray-500 border-gray-200"
      value={copySelectValue}
      onChange={handleCopyFrom}
      onClick={(e) => e.stopPropagation()}
    >
      <option value="" disabled>{t('customers.copyConnectionFrom')}</option>
      {otherLicenses.map((ol) => (
        <option key={ol.licIndex} value={ol.licIndex}>
          {ol.label}
        </option>
      ))}
    </select>
  ) : undefined;

  return (
    <CollapsibleBlock
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
      title={t('customers.connectionInfo')}
      headerRight={copyDropdown}
    >
      <DictionarySelect
        name={`${base}.connectionTypeId`}
        label={t('customers.connectionType')}
        items={integrationTypes}
        lang={lang}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label={t('customers.host')} {...register(`${base}.host`)} />
        <Input
          label={t('customers.port')}
          type="number"
          {...register(`${base}.port`, { valueAsNumber: true })}
        />
        <Input label={t('customers.serverUsername')} {...register(`${base}.serverUsername`)} />
        <Input label={t('customers.username')} {...register(`${base}.username`)} />
        <PasswordField name={`${base}.serverPassword`} label={t('customers.serverPassword')} hint={hint} />
        <PasswordField name={`${base}.password`} label={t('customers.password')} hint={hint} />
      </div>
    </CollapsibleBlock>
  );
}

const EMPTY_CONNECTION = {
  connectionTypeId: '',
  host: '',
  port: 0,
  serverUsername: '',
  username: '',
  serverPassword: '',
  password: '',
};

/** Inner component — manages products within a single license entry. */
function LicenseProductsSection({
  licIndex,
  isEdit,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productMap,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allProducts,
  licenseModeOptions,
  licenseTypeOptions,
}: {
  licIndex: number;
  isEdit: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productMap: Map<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allProducts: any[];
  licenseModeOptions: { value: string; label: string }[];
  licenseTypeOptions: { value: string; label: string }[];
}) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control, register, getValues } = useFormContext() as any;
  const { fields, append, remove } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: `licenseInfo.licenses.${licIndex}.products` as any,
  });
  const confirmRemove = useConfirmDialog();

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const prevLengthRef = React.useRef(fields.length);
  React.useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      const newField = fields[fields.length - 1] as { id: string };
      if (newField) setExpandedIds((prev) => { const s = new Set(prev); s.add(newField.id); return s; });
    }
    prevLengthRef.current = fields.length;
  }, [fields]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const [selectValue, setSelectValue] = React.useState('');
  const addedIds = new Set((fields as unknown as { productId: string }[]).map((f) => f.productId));
  const availableToAdd = (Array.isArray(allProducts) ? allProducts : []).filter(
    (p) => !p.isBlocked && !addedIds.has(p.id),
  );

  const handleAddProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    if (!productId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (append as any)({
      productId,
      licenseModeId: '',
      licenseTypeId: '',
      endDate: '',
      track: false,
      licenseKey: '',
      licenseData: {},
    });
    setSelectValue('');
  };

  return (
    <div className="space-y-2">
      {(fields as unknown as { id: string; productId: string }[]).map((field, prodIndex) => {
        const product = productMap.get(field.productId);
        const productName = product ? resolveTranslation(product.name, lang) : field.productId;
        const template = product?.licenseTemplate ?? [];
        const isExpanded = expandedIds.has(field.id);

        return (
          <CollapsibleBlock
            key={field.id}
            expanded={isExpanded}
            onToggle={() => toggleExpand(field.id)}
            title={productName}
            className="ml-2 border-gray-200"
            headerRight={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 shrink-0"
                onClick={() => {
                  confirmRemove.requestConfirm(async () => {
                    remove(prodIndex);
                    setExpandedIds((prev) => { const s = new Set(prev); s.delete(field.id); return s; });
                  });
                }}
              >
                ✕
              </Button>
            }
          >
                <Controller
                  control={control}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  name={`licenseInfo.licenses.${licIndex}.products.${prodIndex}.licenseModeId` as any}
                  render={({ field: f }) => (
                    <Select
                      {...f}
                      id={`lic-${licIndex}-prod-${prodIndex}-licenseModeId`}
                      label={t('customers.licenseMode')}
                      options={licenseModeOptions}
                      placeholder="— Select —"
                    />
                  )}
                />
                <Controller
                  control={control}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  name={`licenseInfo.licenses.${licIndex}.products.${prodIndex}.licenseTypeId` as any}
                  render={({ field: f }) => (
                    <Select
                      {...f}
                      id={`lic-${licIndex}-prod-${prodIndex}-licenseTypeId`}
                      label={t('customers.licenseType')}
                      options={licenseTypeOptions}
                      placeholder="— Select —"
                    />
                  )}
                />
                <Input
                  label={t('customers.endDate')}
                  type="date"
                  required
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...register(`licenseInfo.licenses.${licIndex}.products.${prodIndex}.endDate` as any)}
                />
                <Checkbox
                  label={t('customers.track')}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...register(`licenseInfo.licenses.${licIndex}.products.${prodIndex}.track` as any)}
                />
                <CopyableInput
                    label={t('customers.licenseKey')}
                    value={getValues(`licenseInfo.licenses.${licIndex}.products.${prodIndex}.licenseKey`) ?? ''}
                  />
                {template.length === 0 ? (
                  <p className="text-xs text-gray-400">{t('customers.noLicenseTemplate')}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {template.map((tf: LicenseTemplateField) => (
                      <LicenseFieldInput
                        key={tf.name}
                        templateField={tf}
                        fieldPath={`licenseInfo.licenses.${licIndex}.products.${prodIndex}.licenseData.${tf.name}`}
                      />
                    ))}
                  </div>
                )}
          </CollapsibleBlock>
        );
      })}

      {fields.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">{t('common.noData')}</p>
      )}

      {availableToAdd.length > 0 && (
        <select
          className="mt-1 w-full form-select text-sm text-gray-600"
          value={selectValue}
          onChange={handleAddProduct}
        >
          <option value="" disabled>+ {t('customers.addProduct')}</option>
          {availableToAdd.map((p) => (
            <option key={p.id} value={p.id}>
              {resolveTranslation(p.name, lang)}
            </option>
          ))}
        </select>
      )}

      <ConfirmDialog
        isOpen={confirmRemove.isOpen}
        onClose={confirmRemove.close}
        onConfirm={confirmRemove.confirm}
        title={t('customers.removeProductTitle')}
        message={t('customers.removeProductMessage')}
      />
    </div>
  );
}

export function LicenseInfoTab({ isEdit }: { isEdit: boolean }) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control, register, watch, formState: { errors } } = useFormContext() as any;
  const { fields, append, remove } = useFieldArray({ control, name: 'licenseInfo.licenses' });
  const confirmRemoveLicense = useConfirmDialog();

  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: getProducts,
  });

  const { data: licenseTypeDictItems = [] } = useQuery({
    queryKey: queryKeys.dict('licenseTypes'),
    queryFn: () => getDictionary('licenseTypes'),
  });

  const licenseModeOptions = LICENSE_MODE_IDS.map((id) => ({
    value: id,
    label: t(`licenseModes.${id}`),
  }));

  const licenseTypeOptions = licenseTypeDictItems.map((lt) => ({
    value: lt.id,
    label: resolveTranslation(lt.name, lang),
  }));

  const productMap = React.useMemo(
    () => new Map((Array.isArray(allProducts) ? allProducts : []).map((p) => [p.id, p])),
    [allProducts],
  );

  const [expandedLicIds, setExpandedLicIds] = React.useState<Set<string>>(new Set());
  const prevLengthRef = React.useRef(fields.length);
  React.useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      const newField = fields[fields.length - 1];
      if (newField) setExpandedLicIds((prev) => { const s = new Set(prev); s.add(newField.id); return s; });
    }
    prevLengthRef.current = fields.length;
  }, [fields]);

  const toggleLicense = (id: string) => {
    setExpandedLicIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const handleAddLicense = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (append as (value: any) => void)({ name: '', hardwareKey: '', appId: '', products: [], connectionInfo: { ...EMPTY_CONNECTION } });
  };

  return (
    <>
      <div className="space-y-3">
        {fields.map((licField, licIndex) => {
          const isExpanded = expandedLicIds.has(licField.id);
          const otherLicenses = fields
            .map((f, i) => ({ licIndex: i, label: `${t('customers.license')} #${i + 1}` }))
            .filter((_, i) => i !== licIndex);
          return (
            <div key={licField.id} className="border border-gray-300 rounded-md overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100">
                <button
                  type="button"
                  className="flex items-center gap-2 flex-1 text-left text-sm font-semibold text-gray-700 hover:text-gray-900"
                  onClick={() => toggleLicense(licField.id)}
                >
                  <span className={`text-xs inline-block transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                  {t('customers.license')} #{licIndex + 1}
                  {(() => {
                    const prods = (watch(`licenseInfo.licenses.${licIndex}.products`) ?? []) as { productId: string }[];
                    const names = prods
                      .map((p) => productMap.get(p.productId))
                      .filter((p): p is NonNullable<typeof p> => Boolean(p))
                      .map((p) => resolveTranslation(p.name, lang))
                      .filter(Boolean);
                    return names.length > 0
                      ? <span className="ml-2 text-xs font-normal text-gray-500 truncate">({names.join(', ')})</span>
                      : null;
                  })()}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 shrink-0"
                  onClick={() => confirmRemoveLicense.requestConfirm(async () => {
                    remove(licIndex);
                    setExpandedLicIds((prev) => { const s = new Set(prev); s.delete(licField.id); return s; });
                  })}
                >
                  ✕
                </Button>
              </div>

              {isExpanded && (
                <div className="px-3 py-3 space-y-3 border-t border-gray-200">
                  <Input
                    label={t('customers.licenseName')}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...register(`licenseInfo.licenses.${licIndex}.name` as any)}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    error={(errors as any)?.licenseInfo?.licenses?.[licIndex]?.name?.message
                      ? t(`customers.${(errors as any).licenseInfo.licenses[licIndex].name.message}`)
                      : undefined}
                  />
                  <Input
                    label={t('customers.hardwareKey')}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...register(`licenseInfo.licenses.${licIndex}.hardwareKey` as any)}
                  />
                  <CopyableInput
                    label={t('customers.appId')}
                    value={watch(`licenseInfo.licenses.${licIndex}.appId`) ?? ''}
                  />
                  <LicenseConnectionFields
                    licIndex={licIndex}
                    isEdit={isEdit}
                    otherLicenses={otherLicenses}
                  />
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {t('customers.productTypes')}
                    </p>
                    <LicenseProductsSection
                      licIndex={licIndex}
                      isEdit={isEdit}
                      allProducts={Array.isArray(allProducts) ? allProducts : []}
                      productMap={productMap}
                      licenseModeOptions={licenseModeOptions}
                      licenseTypeOptions={licenseTypeOptions}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {fields.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-3">{t('common.noData')}</p>
        )}

        <Button type="button" variant="secondary" size="sm" onClick={handleAddLicense}>
          + {t('customers.addLicense')}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmRemoveLicense.isOpen}
        onClose={confirmRemoveLicense.close}
        onConfirm={confirmRemoveLicense.confirm}
        title={t('customers.removeLicenseTitle')}
        message={t('customers.removeLicenseMessage')}
      />
    </>
  );
}

