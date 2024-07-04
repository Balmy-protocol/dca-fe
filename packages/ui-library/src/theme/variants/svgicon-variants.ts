import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildSvgIconVariant = (mode: 'light' | 'dark'): Components => ({
  MuiSvgIcon: {
    styleOverrides: {
      colorDisabled: {
        color: colors[mode].typography.typo5,
      },

      root: {
        '&.MuiSvgIcon-colorSuccess': {
          color: colors[mode].semantic.success.darker,
        },
        '&.MuiSvgIcon-colorWarning': {
          color: colors[mode].semantic.warning.darker,
        },
        '&.MuiSvgIcon-colorError': {
          color: colors[mode].semantic.error.darker,
        },
        '&.MuiSvgIcon-colorInfo': {
          color: colors[mode].typography.typo3,
        },
      },
      fontSizeLarge: {
        fontSize: '2rem',
      },
    },
  },
});
