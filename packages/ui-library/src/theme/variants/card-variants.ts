import type { Components } from '@mui/material/styles';
import { baseColors, colors } from '../colors';
import { SPACING } from '../constants';

export const buildCardVariant = (mode: 'light' | 'dark'): Components => ({
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: SPACING(4),
        backgroundColor: colors[mode].background.tertiary,
        boxShadow: baseColors.dropShadow.dropShadow200,
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        display: 'flex',
        flexGrow: '1',
        flexDirection: 'column',
      },
    },
  },
});
