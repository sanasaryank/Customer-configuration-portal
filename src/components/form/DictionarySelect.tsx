import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Select } from '../ui/Select';
import type { LangCode } from '../../types/common';
import type { HasIdAndName } from '../../utils/lookup';
import { buildSelectOptions } from '../../utils/lookup';

interface DictionarySelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  items: HasIdAndName[] | null | undefined;
  lang: LangCode;
  required?: boolean;
  disabled?: boolean;
  allowEmpty?: boolean;
}

export function DictionarySelect({
  name,
  label,
  placeholder,
  items,
  lang,
  required,
  disabled,
  allowEmpty = true,
}: DictionarySelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const options = buildSelectOptions(items, lang);

  // Resolve nested error
  const parts = name.split('.');
  let errorObj: unknown = errors;
  for (const part of parts) {
    if (!errorObj || typeof errorObj !== 'object') { errorObj = undefined; break; }
    errorObj = (errorObj as Record<string, unknown>)[part];
  }
  const errorMsg =
    errorObj && typeof errorObj === 'object' && 'message' in errorObj
      ? String((errorObj as { message: unknown }).message)
      : undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          {...field}
          id={name}
          label={label}
          options={options}
          placeholder={
            allowEmpty ? (placeholder ?? '— Select —') : undefined
          }
          error={errorMsg}
          disabled={disabled}          required={required}          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
        />
      )}
    />
  );
}
