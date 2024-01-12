import type { Components } from '@mui/material/styles';
import { colors } from './colors';
import { SPACING } from './constants';

export const buildInputsVariant = (mode: 'light' | 'dark'): Components => ({
  MuiTextField: {
    styleOverrides: {
      root: {
        MuiInputBase: {
          borderRadius: SPACING(2),
          border: `1px solid ${colors[mode].border.border1}`,
          background: colors[mode].background.secondary,
          padding: `${SPACING(2.5)} ${SPACING(3)}`,
        },
      },
    },
  },
});
