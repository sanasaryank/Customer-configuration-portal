import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import type { Translation } from '../../types/common';

interface TranslationEditorProps {
  /** Name prefix in the form, e.g. "name" which expands to "name.ARM", "name.ENG", "name.RUS" */
  fieldName: string;
  label?: string;
  required?: boolean;
}

const LANG_LABELS: { key: keyof Translation; i18nKey: string }[] = [
  { key: 'ARM', i18nKey: 'translation.arm' },
  { key: 'ENG', i18nKey: 'translation.eng' },
  { key: 'RUS', i18nKey: 'translation.rus' },
];

export function TranslationEditor({
  fieldName,
  label,
  required,
}: TranslationEditorProps) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Resolve nested error from the form state
  const getError = (key: string): string | undefined => {
    const parts = key.split('.');
    let current: unknown = errors;
    for (const part of parts) {
      if (!current || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    if (current && typeof current === 'object' && 'message' in current) {
      return String((current as { message: unknown }).message);
    }
    return undefined;
  };

  return (
    <fieldset className="border border-gray-200 rounded-md p-3">
      {label && (
        <legend className="text-sm font-medium text-gray-700 px-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </legend>
      )}
      <div className="grid grid-cols-1 gap-3">
        {LANG_LABELS.map(({ key, i18nKey }) => {
          const inputName = `${fieldName}.${key}`;
          return (
            <Input
              key={key}
              label={t(i18nKey)}
              error={getError(inputName)}
              {...register(inputName)}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
