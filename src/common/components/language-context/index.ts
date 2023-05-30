import { SupportedLanguages } from '@constants/lang';
import * as React from 'react';

export type LanguageContextValue = {
  language: SupportedLanguages;
  onChangeLanguage: (newLang: SupportedLanguages) => void;
};

export const LanguageContextDefaultValue: LanguageContextValue = {
  language: SupportedLanguages.english,
  onChangeLanguage: () => {},
};

const LanguageContext = React.createContext(LanguageContextDefaultValue);

export default LanguageContext;
