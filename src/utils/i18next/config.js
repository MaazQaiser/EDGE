import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';

/** Language codes only; locale JSON for non-English loads on demand. */
export const languages = {
  english: ['en'],
  spanish: ['es'],
  french: ['fr'],
  german: ['de'],
};

const LANGUAGE_CODES = Object.values(languages).map((lang) => lang[0]);

const lazyLocaleLoaders = {
  de: () => import('./locales/de'),
  es: () => import('./locales/es'),
  fr: () => import('./locales/fr'),
};

const loadedLocales = new Set(['en']);

async function ensureLocaleLoaded(lng) {
  if (!lng || lng === 'en' || loadedLocales.has(lng)) {
    return;
  }
  const loader = lazyLocaleLoaders[lng];
  if (!loader) {
    return;
  }
  const mod = await loader();
  i18n.addResourceBundle(lng, 'translations', mod.default, true, true);
  loadedLocales.add(lng);
}

const resources = {
  en: {
    translations: en,
  },
};

i18n.use(initReactI18next).init({
  fallbackLng: languages.english[0],
  lng: languages.english[0],
  resources,
  ns: ['translations'],
  defaultNS: 'translations',
});

i18n.languages = LANGUAGE_CODES;

const originalChangeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (...args) => {
  const lng = args[0];
  await ensureLocaleLoaded(lng);
  return originalChangeLanguage(...args);
};

export default i18n;
