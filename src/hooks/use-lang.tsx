import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type Lang, t } from '@/lib/i18n';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('hugme-lang');
    return (saved === 'en' ? 'en' : 'ru') as Lang;
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('hugme-lang', l);
  }, []);

  const value: LangContextValue = {
    lang,
    setLang,
    t: useCallback((key: string) => t(key, lang), [lang]),
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
