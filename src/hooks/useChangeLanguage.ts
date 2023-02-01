import React from 'react';
import LanguageContext from 'common/language-context';

function useChangeLanguage() {
  const context = React.useContext(LanguageContext);

  return context.onChangeLanguage;
}

export default useChangeLanguage;
