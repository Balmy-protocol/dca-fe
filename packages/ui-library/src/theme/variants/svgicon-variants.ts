import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildSvgIconVariant = (mode: 'light' | 'dark'): Components => ({
  MuiSvgIcon: {
    styleOverrides: {
      colorError: colors[mode].semantic.error.darker,
      root: {
        '&.MuiSvgIcon-colorSuccess': {
          color: colors[mode].semantic.success.darker,
        },
        '&.MuiSvgIcon-colorWarning': {
          color: colors[mode].semantic.warning.darker,
        },
      },
    },
  },
});
