import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Select } from '../ui/Select';
import { useTranslation } from 'react-i18next';
import type { LangCode } from '../../types/common';
import type { CountryListItem } from '../../types/country';
import type { CityListItem } from '../../types/city';
import type { DistrictListItem } from '../../types/district';
import { buildSelectOptions } from '../../utils/lookup';

interface GeoSelectorProps {
  /** Name prefix, e.g. "contactInfo.geo" */
  prefix: string;
  countries: CountryListItem[];
  cities: CityListItem[];
  districts: DistrictListItem[];
  lang: LangCode;
}

export function GeoSelector({
  prefix,
  countries,
  cities,
  districts,
  lang,
}: GeoSelectorProps) {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext();

  const countryId = useWatch({ control, name: `${prefix}.countryId` });
  const cityId = useWatch({ control, name: `${prefix}.cityId` });

  const filteredCities = cities.filter((c) => c.countryId === countryId);
  const filteredDistricts = districts.filter((d) => d.cityId === cityId);

  const countryOptions = buildSelectOptions(countries as never, lang);
  const cityOptions = buildSelectOptions(filteredCities as never, lang);
  const districtOptions = buildSelectOptions(filteredDistricts as never, lang);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Controller
        control={control}
        name={`${prefix}.countryId`}
        render={({ field }) => (
          <Select
            {...field}
            label={t('customers.country')}
            options={countryOptions}
            placeholder="— Select —"
            value={field.value ?? ''}
            onChange={(e) => {
              field.onChange(e.target.value);
              // Reset dependent fields when country changes
              setValue(`${prefix}.cityId`, '');
              setValue(`${prefix}.districtId`, '');
            }}
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.cityId`}
        render={({ field }) => (
          <Select
            {...field}
            label={t('customers.city')}
            options={cityOptions}
            placeholder="— Select —"
            value={field.value ?? ''}
            disabled={!countryId}
            onChange={(e) => {
              field.onChange(e.target.value);
              // Reset district when city changes
              setValue(`${prefix}.districtId`, '');
            }}
          />
        )}
      />
      <Controller
        control={control}
        name={`${prefix}.districtId`}
        render={({ field }) => (
          <Select
            {...field}
            label={t('customers.district')}
            options={districtOptions}
            placeholder="— Select —"
            value={field.value ?? ''}
            disabled={!cityId}
            onChange={(e) => field.onChange(e.target.value)}
          />
        )}
      />
    </div>
  );
}
