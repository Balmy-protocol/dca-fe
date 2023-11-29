export { Theme } from '@mui/material/styles';
import type { Components, PaletteOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { backgroundColors, borderColors } from './colors';
import { buildButtonVariant } from './button-variants';
import { MuiCssBaseline } from './baseline';
import { typography } from './typography';

const darkModePallete: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#791AFF',
    dark: '#270C51',
    contrastText: '#FBFAFF',
  },
  secondary: {
    main: '#07F8BD',
    dark: '#024A39',
  },
  error: {
    main: '#EF5D54',
  },
  warning: {
    main: '#F3E778',
  },
  success: {
    main: '#81EC70',
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  transparent: {
    main: backgroundColors.transparent.dark.default,
  },
  default: {
    main: backgroundColors.default.dark.default,
  },
  migrate: {
    main: borderColors.migrate.dark.default,
  },
  pending: {
    main: backgroundColors.pending.dark.default,
  },
  background: {
    paper: '#160033',
    default: '#0C001A',
  },
};

const lightModePallete: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#791AFF',
    dark: '#270C51',
    contrastText: '#FBFAFF',
  },
  secondary: {
    main: '#07F8BD',
    dark: '#024A39',
  },
  error: {
    main: '#EF5D54',
  },
  warning: {
    main: '#F3E778',
  },
  success: {
    main: '#81EC70',
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  transparent: {
    main: backgroundColors.transparent.light.default,
  },
  default: {
    main: backgroundColors.default.light.default,
  },
  migrate: {
    main: borderColors.migrate.light.default,
  },
  pending: {
    main: backgroundColors.pending.light.default,
  },
  background: {
    paper: '#160033',
    default: '#0C001A',
  },
};

const lightModeVariants: Components = buildButtonVariant('light');

const darkModeVariants: Components = buildButtonVariant('dark');

const baseComponents = {
  MuiCssBaseline,
};

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
  components: {
    ...baseComponents,
    ...darkModeVariants,
  },
});

export const lightTheme = createTheme({
  ...baseThemeDefinition,
  palette: lightModePallete,
  components: {
    ...baseComponents,
    ...lightModeVariants,
  },
});
