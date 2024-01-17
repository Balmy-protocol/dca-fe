import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildInputBaseVariant = (mode: 'light' | 'dark'): Components => ({
  MuiInputBase: {
    styleOverrides: {
      root: {
        '&:hover': {
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: `${colors[mode].accentPrimary} !important`,
          },
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: SPACING(2),
        backgroundColor: colors[mode].background.secondary,
      },
      notchedOutline: {
        borderColor: colors[mode].border.border1,
      },
    },
  },
});
