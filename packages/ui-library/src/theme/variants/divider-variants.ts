import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildDividerVariant = (mode: 'light' | 'dark'): Components => ({
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: colors[mode].border.border2,
        borderWidth: '1px',
      },
    },
  },
});
