export { Theme } from '@mui/material/styles';
import { Theme, createTheme } from '@mui/material/styles';
import { typography } from './typography';
import { darkModePallete, lightModePallete } from './pallete';
import { lightModeComponents, darkModeComponents } from './components';
export { colors, baseColors } from './colors';
import { DEFAULT_SPACING, DEFAULT_BORDER_RADIUS } from './constants';

const baseThemeDefinition = {
  palette: darkModePallete,
  typography,
  spacing: DEFAULT_SPACING,
  shape: {
    borderRadius: DEFAULT_BORDER_RADIUS,
  },
};

export const baseTheme = createTheme(baseThemeDefinition);

export const darkTheme = createTheme({
  ...baseThemeDefinition,
  palette: darkModePallete,
  components: darkModeComponents,
});

export const lightTheme = createTheme({
  ...baseThemeDefinition,
  palette: lightModePallete,
  components: lightModeComponents,
});

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
