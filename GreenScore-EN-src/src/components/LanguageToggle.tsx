import React from 'react';
import { lang, setLang } from '../i18n';

// PT | EN switch. Changing language reloads the page so every text is redrawn.
export const LanguageToggle: React.FC<{ dark?: boolean }> = ({ dark = true }) => {
  const base = 'px-2 py-1 text-[11px] font-bold rounded-md transition-colors';
  const on = dark ? 'bg-emerald-600 text-white' : 'bg-emerald-600 text-white';
  const off = dark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200';
  return (
    <div
      className={`flex items-center gap-0.5 p-0.5 rounded-lg border ${dark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-300'}`}
      role="group"
      aria-label="Language / Idioma"
    >
      <button type="button" className={`${base} ${lang === 'pt' ? on : off}`} onClick={() => lang !== 'pt' && setLang('pt')}>PT</button>
      <button type="button" className={`${base} ${lang === 'en' ? on : off}`} onClick={() => lang !== 'en' && setLang('en')}>EN</button>
    </div>
  );
};
