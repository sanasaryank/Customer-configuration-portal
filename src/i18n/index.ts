import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arm from './locales/arm';
import eng from './locales/eng';
import rus from './locales/rus';
import { DEFAULT_LANG, LANG_TO_I18N } from '../constants/languages';

const defaultLng = LANG_TO_I18N[DEFAULT_LANG]; // 'arm'

i18n.use(initReactI18next).init({
  resources: {
    arm: { translation: arm },
    eng: { translation: eng },
    rus: { translation: rus },
  },
  lng: defaultLng,
  fallbackLng: defaultLng,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
