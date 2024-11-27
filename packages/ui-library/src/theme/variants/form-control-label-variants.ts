import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const formControlLabelVariant = (mode: 'light' | 'dark'): Components => ({
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        '& .Mui-disabled': {
          color: colors[mode].typography.typo3,
          opacity: 0.4,
        },
      },
      label: {
        '&.Mui-disabled': {
          color: colors[mode].typography.typo3,
        },
      },
    },
  },
});
