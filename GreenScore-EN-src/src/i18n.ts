// Simple PT/EN translation layer. Portuguese is the source language:
// t("texto em português") returns the English text when English is selected.
import { en } from './i18n.en';

export type Lang = 'pt' | 'en';
const STORAGE_KEY = 'greenscore_lang';

const readLang = (): Lang => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'pt') return v;
  } catch {}
  return 'pt';
};

export const lang: Lang = readLang();

export const t = (pt: string, vars?: Record<string, string | number>): string => {
  let s = lang === 'en' ? (en[pt] ?? pt) : pt;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
};

export const setLang = (l: Lang) => {
  try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  window.location.reload();
};

// Locale for dates and numbers
export const locale = lang === 'en' ? 'en-GB' : 'pt-PT';

// Translate a displayed value if it is a known Portuguese string (e.g. categories, statuses); anything else passes through unchanged.
export const tv = <V,>(v: V): V => (typeof v === 'string' ? (t(v) as unknown as V) : v);
