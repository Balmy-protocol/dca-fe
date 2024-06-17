import React from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme, lightTheme } from '../../theme';

type ThemeProviderProps = React.PropsWithChildren<{
  mode: 'light' | 'dark';
}>;

const ThemeProvider = ({ mode, children }: ThemeProviderProps) => (
  <MuiThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
    <SCThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      {children}
    </SCThemeProvider>
  </MuiThemeProvider>
);

export { type ThemeProviderProps, ThemeProvider };
