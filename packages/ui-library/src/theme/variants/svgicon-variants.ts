import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildSvgIconVariant = (mode: 'light' | 'dark'): Components => ({
  MuiSvgIcon: {
    styleOverrides: {
      colorDisabled: {
        color: colors[mode].typography.typo5,
      },
      root: {
        color: colors[mode].typography.typo3,
        '&.MuiSvgIcon-colorSuccess': {
          color: colors[mode].semantic.success.darker,
        },
        '&.MuiSvgIcon-colorWarning': {
          color: colors[mode].semantic.warning.darker,
        },
        '&.MuiSvgIcon-colorError': {
          color: colors[mode].semantic.error.darker,
        },
      },
      fontSizeSmall: {
        fontSize: '1.125rem !important', // 18/16
      },
      fontSizeMedium: {
        fontSize: '1.25rem', // 20/16
      },
      fontSizeLarge: {
        fontSize: '1.5rem !important', // 24/16
      },
    },
  },
});
