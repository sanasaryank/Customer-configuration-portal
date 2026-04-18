import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '../../../api/employees';
import { getDictionary } from '../../../api/dictionaries';
import { queryKeys } from '../../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';
import type { CustomerFormValues } from '../../../types/customer';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { DictionarySelect } from '../../../components/form/DictionarySelect';
import { TranslationEditor } from '../../../components/form/TranslationEditor';

export function GeneralInfoTab({ isEdit }: { isEdit: boolean }) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const { register, formState: { errors } } = useFormContext<CustomerFormValues>();

  const { data: employees = [] } = useQuery({ queryKey: queryKeys.employees.all, queryFn: getEmployees });
  const { data: statuses = [] } = useQuery({ queryKey: queryKeys.dict('customerStatus'), queryFn: () => getDictionary('customerStatus') });
  const { data: groups = [] } = useQuery({ queryKey: queryKeys.dict('customerGroups'), queryFn: () => getDictionary('customerGroups') });

  // Map employees to id/name shape expected by DictionarySelect
  const employeeItems = Array.isArray(employees) ? employees.map((e) => ({ id: e.id, name: e.name })) : [];

  return (
    <div className="space-y-4">
      <TranslationEditor fieldName="generalInfo.name" label={t('common.name')} required defaultExpanded={!isEdit} />
      <TranslationEditor fieldName="generalInfo.legalName" label={t('customers.legalName')} defaultExpanded={!isEdit} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DictionarySelect name="generalInfo.responsibleId" label={t('customers.responsible')} items={employeeItems} lang={lang} />
        <DictionarySelect name="generalInfo.statusId" label={t('customers.statusId')} items={statuses} lang={lang} />
        <DictionarySelect name="generalInfo.groupId" label={t('customers.groupId')} items={groups} lang={lang} />
        <Input
          label={t('customers.brandName')}
          error={(errors.generalInfo as Record<string, { message?: string }> | undefined)?.brandName?.message}
          {...register('generalInfo.brandName')}
        />
        <Input
          label={t('customers.tin')}
          error={(errors.generalInfo as Record<string, { message?: string }> | undefined)?.tin?.message}
          {...register('generalInfo.tin')}
        />
        <Input
          label={t('customers.bankAccount')}
          error={(errors.generalInfo as Record<string, { message?: string }> | undefined)?.bankAccount?.message}
          {...register('generalInfo.bankAccount')}
        />
        <Input
          label={t('customers.crmLink')}
          error={(errors.generalInfo as Record<string, { message?: string }> | undefined)?.crmLink?.message}
          {...register('generalInfo.crmLink')}
        />
      </div>

      <Textarea
        label={t('common.description')}
        error={(errors.generalInfo as Record<string, { message?: string }> | undefined)?.description?.message}
        {...register('generalInfo.description')}
      />
    </div>
  );
}
