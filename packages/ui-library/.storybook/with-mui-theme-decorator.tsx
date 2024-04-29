import React, { useMemo } from 'react';

import { ThemeProvider } from '../src/components/theme-provider';

export const withMuiTheme = (Story, context) => {
  const { theme: themeKey } = context.globals;

  return (
    <ThemeProvider mode={themeKey}>
      <Story />
    </ThemeProvider>
  );
};
