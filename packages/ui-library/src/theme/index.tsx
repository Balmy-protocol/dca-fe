export { Theme } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { typography } from './typography';
import { darkModePallete, lightModePallete } from './pallete';
import { lightModeComponents, darkModeComponents } from './components';
export { colors, baseColors } from './colors';
const baseThemeDefinition = {
  palette: darkModePallete,
  typography,
  spacing: 4,
  shape: {
    borderRadius: 8,
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
