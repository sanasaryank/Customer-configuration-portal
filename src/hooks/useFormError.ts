import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { FieldErrors } from 'react-hook-form';

interface ErrorEntry { path: string[]; message: string }

function collectErrors(errors: Record<string, unknown>, maxCount = 5): ErrorEntry[] {
  const entries: ErrorEntry[] = [];
  function walk(obj: unknown, path: string[]): void {
    if (entries.length >= maxCount || obj === null || obj === undefined || typeof obj !== 'object') return;
    const rec = obj as Record<string, unknown>;
    if (typeof rec.message === 'string' && rec.message) {
      entries.push({ path, message: rec.message });
      return;
    }
    for (const key of Object.keys(rec)) {
      if (key === 'type' || key === 'ref' || key === 'types') continue;
      walk(rec[key], [...path, key]);
    }
  }
  walk(errors, []);
  return entries;
}

function formatErrorEntry({ path, message }: ErrorEntry): string {
  // Drop purely numeric segments (array indices) and keep last 2 meaningful segments
  const meaningful = path.filter(k => !/^\d+$/.test(k));
  const label = meaningful.slice(-2).join('.');
  return label ? `${label}: ${message}` : message;
}

export function useFormError(mutationError: Error | null | undefined) {
  const { t } = useTranslation();
  const [validationError, setValidationError] = useState<string | null>(null);

  const onValidationError = useCallback(
    (errors: FieldErrors) => {
      const entries = collectErrors(errors as Record<string, unknown>);
      const total = collectErrors(errors as Record<string, unknown>, 999).length;
      if (entries.length === 0) {
        setValidationError(t('common.validationError'));
      } else {
        const lines = entries.map(formatErrorEntry);
        const extra = total - lines.length;
        const suffix = extra > 0 ? ` (+${extra} more)` : '';
        setValidationError(lines.join(' • ') + suffix);
      }
    },
    [t],
  );

  // Call this at the beginning of onSubmit to clear any stale validation banner
  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  // Validation errors take priority over API errors so the user fixes inputs first
  const errorMessage: string | null =
    validationError ??
    (mutationError
      ? mutationError.message || t('common.errorOccurred')
      : null);

  return { errorMessage, onValidationError, clearValidationError };
}
