import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildChipVariant = (mode: 'light' | 'dark'): Components => ({
  MuiChip: {
    styleOverrides: {
      colorPrimary: {
        color: colors[mode].typography.typo2,
        backgroundColor: colors[mode].background.tertiary,
      },
      colorSecondary: {
        color: colors[mode].typography.typo3,
        backgroundColor: colors[mode].background.quartery,
      },
      colorSuccess: {
        color: colors[mode].semantic.success.darker,
        backgroundColor: colors[mode].semanticBackground.success,
      },
      colorWarning: {
        color: colors[mode].semantic.warning.darker,
        backgroundColor: colors[mode].semanticBackground.warning,
      },
      colorError: {
        color: colors[mode].semantic.error.darker,
        backgroundColor: colors[mode].semanticBackground.error,
      },
    },
  },
});
