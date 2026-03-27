import type { LangCode } from '../types/common';

export const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: 'ARM', label: 'Հայերեն' },
  { code: 'ENG', label: 'English' },
  { code: 'RUS', label: 'Русский' },
];

export const DEFAULT_LANG: LangCode = 'ARM';

// i18next language code mapping: LangCode -> i18next lng key
export const LANG_TO_I18N: Record<LangCode, string> = {
  ARM: 'arm',
  ENG: 'eng',
  RUS: 'rus',
};

export const I18N_TO_LANG: Record<string, LangCode> = {
  arm: 'ARM',
  eng: 'ENG',
  rus: 'RUS',
};
