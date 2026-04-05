import type { Translation, LangCode } from '../types/common';

/**
 * Resolve a translation object to a display string for the given language.
 *
 * Fallback order (per spec §2.7):
 * 1. selected language
 * 2. ARM
 * 3. first non-empty of ENG / RUS
 * 4. empty string
 */
export function resolveTranslation(
  translation: Translation | null | undefined,
  lang: LangCode,
): string {
  if (!translation) return '';

  const selected = translation[lang];
  if (selected && selected.trim() !== '') return selected;

  const arm = translation['ARM'];
  if (arm && arm.trim() !== '') return arm;

  const eng = translation['ENG'];
  if (eng && eng.trim() !== '') return eng;

  const rus = translation['RUS'];
  if (rus && rus.trim() !== '') return rus;

  return '';
}

/** Build an empty Translation object */
export function emptyTranslation(): Translation {
  return { ARM: '', ENG: '', RUS: '' };
}

/**
 * Extract a translation for a specific language WITHOUT fallback.
 * Use this for filter/search operations so that searching in e.g. ENG
 * only matches English text, not Russian or Armenian fallbacks.
 */
export function extractTranslation(
  translation: Translation | null | undefined,
  lang: LangCode,
): string {
  if (!translation) return '';
  return translation[lang] ?? '';
}
