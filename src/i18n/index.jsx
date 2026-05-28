import { createContext, useContext, useMemo, useState } from 'react';
import { translations } from './translations.js';

const LOCALE_KEY = 'starlent_locale';

function normalizeLocale(input) {
  const raw = String(input || '').trim().toLowerCase().replace('_', '-');
  if (raw === 'en' || raw.startsWith('en-')) return 'en';
  if (raw === 'vi' || raw.startsWith('vi-')) return 'vi';
  return 'vi';
}

function readPath(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);
}

function getStoredLocale() {
  const stored = localStorage.getItem(LOCALE_KEY);
  if (stored) return normalizeLocale(stored);
  return normalizeLocale(navigator.language || navigator.languages?.[0] || 'vi');
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getStoredLocale);

  const setLocale = (next) => {
    const value = normalizeLocale(next);
    setLocaleState(value);
    localStorage.setItem(LOCALE_KEY, value);
  };

  const t = (path, fallback) => {
    const primary = readPath(translations[locale], path);
    if (primary !== undefined) return primary;
    const vi = readPath(translations.vi, path);
    if (vi !== undefined) return vi;
    return fallback ?? path;
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
