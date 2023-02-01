import React from 'react';
import LanguageContext from 'common/language-context';

function useSelectedLanguage() {
  const context = React.useContext(LanguageContext);

  return context.language;
}

export default useSelectedLanguage;
