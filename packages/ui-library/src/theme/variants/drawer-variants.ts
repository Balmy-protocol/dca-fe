import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildDrawerVariant = (mode: 'light' | 'dark'): Components => ({
  MuiDrawer: {
    styleOverrides: {
      paper: {
        boxShadow: colors[mode].dropShadow.dropShadow100,
        border: 'none',
      },
    },
  },
});
