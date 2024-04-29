import React from 'react';

import { IntlProvider } from 'react-intl';
export const withReactIntl = (Story) => {
  return (
    <IntlProvider locale="en" defaultLocale="en" messages={{}}>
      <Story />
    </IntlProvider>
  );
};
