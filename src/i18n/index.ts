import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ur from './locales/ur.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';

export const resources = {
  en: { translation: en },
  ur: { translation: ur },
  es: { translation: es },
  fr: { translation: fr },
  ar: { translation: ar },
  hi: { translation: hi },
} as const;

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
