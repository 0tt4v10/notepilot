import { createContext, useContext } from 'react';
import { Language, Translations, translations } from './i18n';

interface LanguageContextValue {
  lang: Language;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'de',
  t: translations.de,
});

export const useLanguage = () => useContext(LanguageContext);
