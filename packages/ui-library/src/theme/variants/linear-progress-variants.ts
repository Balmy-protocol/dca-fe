import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildLinearProgressVariant = (mode: 'light' | 'dark'): Components => ({
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        height: SPACING(2.25),
        borderRadius: SPACING(8.5),
        background: colors[mode].background.secondary,
      },
      bar: {
        borderRadius: SPACING(8.5),
      },
    },
  },
});
