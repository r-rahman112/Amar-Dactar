import React, { createContext, useContext, useEffect, useState } from 'react';
import bnTranslations from '../locales/bn.json';
import enTranslations from '../locales/en.json';

export type Language = 'bn' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (enText: string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  t: (text) => text,
});

export const useTranslation = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('bn');

  useEffect(() => {
    // Try recovering saved language immediately
    const saved = localStorage.getItem('amar-daktar-lang') as Language;
    if (saved === 'bn' || saved === 'en') {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = 'bn';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('amar-daktar-lang', lang);
    document.documentElement.lang = lang;
  };

  const t = (enText: string) => {
    if (language === 'en') {
       // Return English if explicitly in enTranslations, or just the string itself.
       return (enTranslations as Record<string, string>)[enText] || enText;
    }
    // Return Bengali translation
    return (bnTranslations as Record<string, string>)[enText] || enText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
