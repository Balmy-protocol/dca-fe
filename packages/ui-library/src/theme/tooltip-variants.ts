import type { Components } from '@mui/material/styles';
import { colors } from './colors';

export const buildTooltipVariant = (mode: 'light' | 'dark'): Components => ({
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: `${colors[mode].background.emphasis} !important`,
        borderColor: colors[mode].border.border1,
      },
      arrow: {
        backgroundColor: `${colors[mode].background.emphasis} !important`,
        borderColor: colors[mode].border.border1,
        color: `${colors[mode].background.emphasis} !important`,
      },
    },
  },
});
