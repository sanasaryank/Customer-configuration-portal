import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../providers/AuthProvider';
import { Input } from '../ui/Input';
import type { Translation } from '../../types/common';

interface TranslationEditorProps {
  /** Name prefix in the form, e.g. "name" which expands to "name.ARM", "name.ENG", "name.RUS" */
  fieldName: string;
  label?: string;
  required?: boolean;
  /** Whether the section starts expanded. Defaults to true (use false for edit mode). */
  defaultExpanded?: boolean;
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
  defaultExpanded = true,
}: TranslationEditorProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const [expanded, setExpanded] = useState(defaultExpanded);

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

  // Build collapsed preview: show current language value, fallback to first non-empty, or empty
  const getPreview = (): string => {
    const values = watch(fieldName) as Translation | undefined;
    if (!values) return '';
    const current = values[lang];
    if (current) return current;
    // Fallback: first non-empty translation
    for (const { key } of LANG_LABELS) {
      if (values[key]) return values[key];
    }
    return '';
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <button
        type="button"
        className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 text-left text-sm font-medium text-gray-700 hover:text-gray-900"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={`text-xs inline-block transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}>
          ▶
        </span>
        <span>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        {!expanded && (
          <span className="ml-2 text-gray-400 font-normal truncate">
            {getPreview() || '—'}
          </span>
        )}
      </button>
      {expanded && (
        <div className="px-3 py-3 space-y-3 border-t border-gray-100">
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
      )}
    </div>
  );
}
