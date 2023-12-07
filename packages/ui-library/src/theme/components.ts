import { Components } from '@mui/material';
import { MuiCssBaseline } from './baseline';
import { buildButtonVariant } from './button-variants';

const lightModeVariants: Components = buildButtonVariant('light');

const darkModeVariants: Components = buildButtonVariant('dark');

const baseComponents = {
  MuiCssBaseline,
};

export const lightModeComponents = {
  ...baseComponents,
  ...lightModeVariants,
};

export const darkModeComponents = {
  ...baseComponents,
  ...darkModeVariants,
};
