import React from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../../api/products';
import { queryKeys } from '../../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';
import type { CustomerFormValues } from '../../../types/customer';
import { resolveTranslation } from '../../../utils/translation';
import { Input } from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Button } from '../../../components/ui/Button';
import { TranslationEditor } from '../../../components/form/TranslationEditor';
import { PasswordField } from '../../../components/form/PasswordField';

export function UsersTab({ isEdit }: { isEdit: boolean }) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const { control, register, watch, formState: { errors } } = useFormContext<CustomerFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'users' });

  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: getProducts,
  });

  // Only products with hasUsers=true that are in the customer's licenseInfo
  const licenseProductIds = new Set(
    (watch('licenseInfo.licenses') ?? []).flatMap((lic: any) => lic.products ?? []).map((lp: any) => lp.productId),
  );
  const userProducts = Array.isArray(allProducts)
    ? allProducts.filter((p) => p.hasUsers && !p.isBlocked && licenseProductIds.has(p.id))
    : [];

  const addUser = () => {
    append({
      id: '',
      name: { ARM: '', ENG: '', RUS: '' },
      restoreEmail: '',
      username: '',
      password: '',
      allowedProducts: [],
      isBlocked: false,
    });
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const isExistingUser = Boolean(field.id && isEdit);
        const userErrors = (errors.users?.[index] ?? {}) as Record<string, { message?: string }>;

        return (
          <fieldset key={field.id} className="border border-gray-200 rounded-md p-3">
            <legend className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-gray-700 px-1">
                {t('customers.users')} #{index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => remove(index)}
              >
                ✕
              </Button>
            </legend>

            <div className="space-y-3">
              <TranslationEditor fieldName={`users.${index}.name`} label={t('common.name')} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label={t('employees.username')}
                  error={userErrors.username?.message}
                  required
                  {...register(`users.${index}.username`)}
                />
                <Input
                  label={t('customers.restoreEmail')}
                  type="email"
                  error={userErrors.restoreEmail?.message}
                  {...register(`users.${index}.restoreEmail`)}
                />
              </div>

              {/* Password — required for new users, optional when editing */}
              <PasswordField
                name={`users.${index}.password`}
                label={t('customers.password')}
                hint={isExistingUser ? t('customers.passwordHint') : undefined}
                required={!isExistingUser}
              />

              {/* Allowed products — only hasUsers=true products */}
              <fieldset className="border border-gray-200 rounded p-2">
                <legend className="text-xs font-medium text-gray-600 px-1">
                  {t('customers.allowedProducts')}
                </legend>
                <Controller
                  control={control}
                  name={`users.${index}.allowedProducts`}
                  render={({ field: af }) => {
                    const selected = af.value ?? [];
                    const toggle = (id: string) => {
                      af.onChange(
                        selected.includes(id)
                          ? selected.filter((x) => x !== id)
                          : [...selected, id],
                      );
                    };
                    return (
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {userProducts.map((product) => (
                          <label
                            key={product.id}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            <Checkbox
                              checked={selected.includes(product.id)}
                              onChange={() => toggle(product.id)}
                            />
                            <span className="text-xs">
                              {resolveTranslation(product.name, lang)}
                            </span>
                          </label>
                        ))}
                      </div>
                    );
                  }}
                />
              </fieldset>

              <Checkbox
                label={t('employees.isBlocked')}
                {...register(`users.${index}.isBlocked`)}
              />
            </div>
          </fieldset>
        );
      })}

      <Button type="button" variant="secondary" size="sm" onClick={addUser}>
        + {t('customers.addUser')}
      </Button>
    </div>
  );
}
