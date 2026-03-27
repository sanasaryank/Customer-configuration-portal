import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getCountries } from '../../../api/countries';
import { getCities } from '../../../api/cities';
import { getDistricts } from '../../../api/districts';
import { queryKeys } from '../../../queryKeys';
import { useAuth } from '../../../providers/AuthProvider';
import type { CustomerFormValues } from '../../../types/customer';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { GeoSelector } from '../../../components/form/GeoSelector';

export function ContactInfoTab() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const { register, formState: { errors } } = useFormContext<CustomerFormValues>();

  const { data: countries = [] } = useQuery({ queryKey: queryKeys.countries.all, queryFn: getCountries });
  const { data: cities = [] } = useQuery({ queryKey: queryKeys.cities.all, queryFn: getCities });
  const { data: districts = [] } = useQuery({ queryKey: queryKeys.districts.all, queryFn: getDistricts });

  const contactErrors = errors.contactInfo as Record<string, { message?: string }> | undefined;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label={t('customers.phone')} error={contactErrors?.phone?.message} {...register('contactInfo.phone')} />
        <Input label={t('customers.email')} type="email" error={contactErrors?.email?.message} {...register('contactInfo.email')} />
      </div>

      <Textarea label={t('customers.address')} error={contactErrors?.address?.message} {...register('contactInfo.address')} />
      <Textarea label={t('customers.legalAddress')} error={contactErrors?.legalAddress?.message} {...register('contactInfo.legalAddress')} />

      <fieldset className="border border-gray-200 rounded-md p-3">
        <legend className="text-sm font-medium text-gray-700 px-1">Geo</legend>
        <GeoSelector
          prefix="contactInfo.geo"
          countries={countries}
          cities={cities}
          districts={districts}
          lang={lang}
        />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Input
            label={t('customers.lat')}
            type="number"
            step="any"
            {...register('contactInfo.geo.lat', { valueAsNumber: true })}
          />
          <Input
            label={t('customers.lng')}
            type="number"
            step="any"
            {...register('contactInfo.geo.lng', { valueAsNumber: true })}
          />
        </div>
      </fieldset>
    </div>
  );
}
