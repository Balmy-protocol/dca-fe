import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildPaperVariant = (mode: 'light' | 'dark'): Components => ({
  MuiPaper: {
    styleOverrides: {
      outlined: {
        outlineColor: colors[mode].border.border1,
        outlineStyle: 'solid',
      },
    },
  },
});
