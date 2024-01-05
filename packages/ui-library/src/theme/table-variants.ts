import type { Components } from '@mui/material/styles';
import { colors } from './colors';

export const buildTableVariant = (mode: 'light' | 'dark'): Components => ({
  MuiTableContainer: {
    styleOverrides: {
      root: {
        backgroundColor: `${colors[mode].background.quartery} !important`,
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        backgroundColor: `${colors[mode].background.secondary} !important`,
      },
      head: {
        backgroundColor: `${colors[mode].background.quarteryNoAlpha} !important`,
      },
    },
  },
});
