import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildAppBarVariant = (mode: 'light' | 'dark'): Components => ({
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: colors[mode].dropShadow.dropShadow100,
      },
    },
  },
});
