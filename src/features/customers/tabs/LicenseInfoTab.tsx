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
import { LICENSE_TYPE_IDS } from '../../../constants/licenseTypes';
import { resolveTranslation } from '../../../utils/translation';
import { Input } from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { DictionarySelect } from '../../../components/form/DictionarySelect';
import { PasswordField } from '../../../components/form/PasswordField';

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

/** Connection fields rendered inside each product block. */
function ProductConnectionFields({
  index,
  isEdit,
  otherProducts,
}: {
  index: number;
  isEdit: boolean;
  otherProducts: { index: number; label: string }[];
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
    const srcIndex = Number(e.target.value);
    if (Number.isNaN(srcIndex)) return;
    const src = getValues(`licenseInfo.products.${srcIndex}.connectionInfo`);
    // Copy everything except write-only passwords (never pre-filled)
    setValue(`licenseInfo.products.${index}.connectionInfo`, {
      ...src,
      serverPassword: '',
      password: '',
    });
    setCopySelectValue('');
  };

  const base = `licenseInfo.products.${index}.connectionInfo`;
  const hint = isEdit ? t('customers.passwordHint') : undefined;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t('customers.connectionInfo')}
        </span>
        {otherProducts.length > 0 && (
          <select
            className="text-xs form-select py-1 pr-7 text-gray-500 border-gray-200"
            value={copySelectValue}
            onChange={handleCopyFrom}
          >
            <option value="" disabled>{t('customers.copyConnectionFrom')}</option>
            {otherProducts.map((op) => (
              <option key={op.index} value={op.index}>{op.label}</option>
            ))}
          </select>
        )}
      </div>

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
    </div>
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

export function LicenseInfoTab({ isEdit }: { isEdit: boolean }) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const { control, register } = useFormContext<CustomerFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'licenseInfo.products' });

  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: getProducts,
  });

  const licenseTypeOptions = LICENSE_TYPE_IDS.map((id) => ({
    value: id,
    label: t(`licenseTypes.${id}`),
  }));

  const productMap = React.useMemo(
    () => new Map((Array.isArray(allProducts) ? allProducts : []).map((p) => [p.id, p])),
    [allProducts],
  );

  // Track which blocks are expanded; new items auto-expand
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const prevLengthRef = React.useRef(fields.length);
  React.useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      const newField = fields[fields.length - 1];
      setExpandedIds((prev) => { const s = new Set(prev); s.add(newField.id); return s; });
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

  // Controlled select value so it resets after each add
  const [selectValue, setSelectValue] = React.useState('');
  const addedIds = new Set(fields.map((f) => f.productId));
  const availableToAdd = (Array.isArray(allProducts) ? allProducts : []).filter(
    (p) => !p.isBlocked && !addedIds.has(p.id),
  );

  const handleAddProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    if (!productId) return;
    append({ productId, licenseTypeId: '', endDate: '', hardwareKey: '', licenseKey: '', licenseData: {}, connectionInfo: { ...EMPTY_CONNECTION } });
    setSelectValue('');
  };

  return (
    <div className="space-y-2">
      {fields.map((field, index) => {
        const product = productMap.get(field.productId);
        const productName = product ? resolveTranslation(product.name, lang) : field.productId;
        const template = product?.licenseTemplate ?? [];
        const isExpanded = expandedIds.has(field.id);

        const otherProducts = fields
          .map((f, i) => ({ index: i, label: productMap.get(f.productId) ? resolveTranslation(productMap.get(f.productId)!.name, lang) : f.productId }))
          .filter((_, i) => i !== index);

        return (
          <div key={field.id} className="border border-gray-200 rounded-md overflow-hidden">
            {/* Header row — always visible */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
              <button
                type="button"
                className="flex items-center gap-2 flex-1 text-left text-sm font-medium text-gray-700 hover:text-gray-900"
                onClick={() => toggleExpand(field.id)}
              >
                <span
                  className={`text-xs inline-block transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                >
                  ▶
                </span>
                {productName}
              </button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 shrink-0"
                onClick={() => {
                  remove(index);
                  setExpandedIds((prev) => { const s = new Set(prev); s.delete(field.id); return s; });
                }}
              >
                ✕
              </Button>
            </div>

            {/* Expanded body */}
            {isExpanded && (
              <div className="px-3 py-3 space-y-3 border-t border-gray-100">
                {/* License fields */}
                <Controller
                  control={control}
                  name={`licenseInfo.products.${index}.licenseTypeId`}
                  render={({ field }) => (
                    <Select
                      {...field}
                      id={`licenseInfo.products.${index}.licenseTypeId`}
                      label={t('customers.licenseType')}
                      options={licenseTypeOptions}
                      placeholder="— Select —"
                      required
                    />
                  )}
                />
                <Input
                  label={t('customers.endDate')}
                  type="date"
                  required
                  {...register(`licenseInfo.products.${index}.endDate`)}
                />
                <Input
                  label={t('customers.hardwareKey')}
                  {...register(`licenseInfo.products.${index}.hardwareKey`)}
                />
                <Input
                  label={t('customers.licenseKey')}
                  {...register(`licenseInfo.products.${index}.licenseKey`)}
                />
                {template.length === 0 ? (
                  <p className="text-xs text-gray-400">{t('customers.noLicenseTemplate')}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {template.map((tf) => (
                      <LicenseFieldInput
                        key={tf.name}
                        templateField={tf}
                        fieldPath={`licenseInfo.products.${index}.licenseData.${tf.name}`}
                      />
                    ))}
                  </div>
                )}

                {/* Per-product connection info */}
                <ProductConnectionFields
                  index={index}
                  isEdit={isEdit}
                  otherProducts={otherProducts}
                />
              </div>
            )}
          </div>
        );
      })}

      {fields.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-3">{t('common.noData')}</p>
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
    </div>
  );
}

