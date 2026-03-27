import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getDictionary } from '../../../api/dictionaries';
import { queryKeys } from '../../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';
import type { CustomerFormValues } from '../../../types/customer';
import { Input } from '../../../components/ui/Input';
import { DictionarySelect } from '../../../components/form/DictionarySelect';
import { PasswordField } from '../../../components/form/PasswordField';

export function ConnectionInfoTab({ isEdit }: { isEdit: boolean }) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const { register, formState: { errors } } = useFormContext<CustomerFormValues>();

  const { data: integrationTypes = [] } = useQuery({
    queryKey: queryKeys.dict('integrationTypes'),
    queryFn: () => getDictionary('integrationTypes'),
  });

  const connErrors = errors.connectionInfo as Record<string, { message?: string }> | undefined;

  return (
    <div className="space-y-4">
      <DictionarySelect
        name="connectionInfo.connectionTypeId"
        label={t('customers.connectionType')}
        items={integrationTypes}
        lang={lang}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label={t('customers.host')} error={connErrors?.host?.message} {...register('connectionInfo.host')} />
        <Input
          label={t('customers.port')}
          type="number"
          error={connErrors?.port?.message}
          {...register('connectionInfo.port', { valueAsNumber: true })}
        />
        <Input label={t('customers.serverUsername')} error={connErrors?.serverUsername?.message} {...register('connectionInfo.serverUsername')} />
        <Input label={t('customers.username')} error={connErrors?.username?.message} {...register('connectionInfo.username')} />
      </div>

      {/* Write-only password fields — per spec §5.7.2, never prefilled */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PasswordField
          name="connectionInfo.serverPassword"
          label={t('customers.serverPassword')}
          hint={isEdit ? t('customers.passwordHint') : undefined}
        />
        <PasswordField
          name="connectionInfo.password"
          label={t('customers.password')}
          hint={isEdit ? t('customers.passwordHint') : undefined}
        />
      </div>
    </div>
  );
}
