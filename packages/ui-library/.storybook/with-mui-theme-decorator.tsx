import React, { useMemo } from 'react';

import { ThemeProvider } from '../src/components/theme-provider';
import { lightTheme, darkTheme } from '../src/theme';

const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const withMuiTheme = (Story, context) => {
  const { theme: themeKey } = context.globals;

  // only recompute the theme if the themeKey changes
  const theme = useMemo(() => themes[themeKey] || themes['light'], [themeKey]);

  return (
    <ThemeProvider mode={theme}>
      <Story />
    </ThemeProvider>
  );
};
