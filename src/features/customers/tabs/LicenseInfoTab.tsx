import React from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../../api/products';
import { queryKeys } from '../../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';
import type { CustomerFormValues } from '../../../types/customer';
import type { LicenseTemplateField } from '../../../types/product';
import { resolveTranslation } from '../../../utils/translation';
import { Input } from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Badge } from '../../../components/ui/Badge';

/**
 * Renders dynamic input for a single license template field.
 * kind determines the input type.
 */
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
      return (
        <Checkbox
          label={templateField.name}
          {...register(fieldPath)}
        />
      );
    default:
      inputProps.type = 'text';
  }

  return (
    <Input
      label={`${templateField.name}${templateField.required ? ' *' : ''}`}
      {...inputProps}
      {...register(fieldPath)}
    />
  );
}

export function LicenseInfoTab() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const { control, register, watch } = useFormContext<CustomerFormValues>();
  const { fields } = useFieldArray({ control, name: 'licenseInfo.products' });

  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: getProducts,
  });

  const watchedProducts = watch('products') ?? [];

  const productMap = React.useMemo(
    () => new Map(allProducts.map((p) => [p.id, p])),
    [allProducts],
  );

  return (
    <div className="space-y-4">
      {/* Hardware key */}
      <Input
        label={t('customers.hardwareKey')}
        {...register('licenseInfo.hardwareKey')}
      />

      {/* License blocks per product */}
      {fields.map((field, index) => {
        const productId = field.productId;
        const product = productMap.get(productId);
        const isProductActive = watchedProducts.includes(productId);
        const template = product?.licenseTemplate ?? [];
        const productName = product
          ? resolveTranslation(product.name, lang)
          : productId;

        return (
          <fieldset
            key={field.id}
            className={`border rounded-md p-3 ${
              isProductActive
                ? 'border-gray-200'
                : 'border-gray-300 bg-gray-50 opacity-60'
            }`}
          >
            <legend className="flex items-center gap-2 text-sm font-medium text-gray-700 px-1">
              <span>{productName}</span>
              {!isProductActive && (
                <Badge variant="warning">{t('customers.disabledLicenseBlock')}</Badge>
              )}
            </legend>

            <div className="space-y-3">
              {/* License key */}
              <Input
                label={t('customers.licenseKey')}
                {...register(`licenseInfo.products.${index}.licenseKey`)}
                disabled={!isProductActive}
              />

              {/* movedFrom / movedTo */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t('customers.movedFrom')}
                  {...register(`licenseInfo.products.${index}.movedFrom`)}
                  disabled={!isProductActive}
                />
                <Input
                  label={t('customers.movedTo')}
                  {...register(`licenseInfo.products.${index}.movedTo`)}
                  disabled={!isProductActive}
                />
              </div>

              {/* Dynamic licenseData fields from template */}
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
            </div>
          </fieldset>
        );
      })}

      {fields.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">{t('common.noData')}</p>
      )}
    </div>
  );
}
