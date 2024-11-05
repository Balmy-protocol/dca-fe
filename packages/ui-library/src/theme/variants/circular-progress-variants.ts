import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildCircularProgressVariant = (mode: 'light' | 'dark'): Components => ({
  MuiCircularProgress: {
    styleOverrides: {
      colorSecondary: {
        color: colors[mode].accent.accent100,
      },
    },
  },
});
