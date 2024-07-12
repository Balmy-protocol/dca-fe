import { Theme, createTheme } from '@mui/material/styles';
import { buildTypographyVariant } from './typography';
import { darkModePallete, lightModePallete } from './pallete';
import { lightModeComponents, darkModeComponents } from './components';
export { colors, baseColors } from './colors';
import { DEFAULT_SPACING, DEFAULT_BORDER_RADIUS } from './constants';

const baseThemeDefinition = {
  palette: darkModePallete,
  spacing: DEFAULT_SPACING,
  shape: {
    borderRadius: DEFAULT_BORDER_RADIUS,
  },
};

export const baseTheme = createTheme(baseThemeDefinition);

export const darkTheme = createTheme({
  ...baseThemeDefinition,
  typography: buildTypographyVariant('dark'),
  palette: darkModePallete,
  components: darkModeComponents,
});

export const lightTheme = createTheme({
  ...baseThemeDefinition,
  typography: buildTypographyVariant('light'),
  palette: lightModePallete,
  components: lightModeComponents,
});

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
