import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildChipVariant = (mode: 'light' | 'dark'): Components => ({
  MuiChip: {
    styleOverrides: {
      label: {
        padding: 0,
      },
      root: {
        padding: `${SPACING(1)} ${SPACING(2)}`,
      },
      colorPrimary: {
        color: colors[mode].typography.typo2,
        backgroundColor: colors[mode].background.tertiary,
        border: `1.5px solid ${colors[mode].border.border2}`,
      },
      colorSecondary: {
        color: colors[mode].typography.typo3,
        backgroundColor: colors[mode].background.quartery,
        border: `1.5px solid ${colors[mode].border.border1}`,
      },
      filledSecondary: {
        color: colors[mode].typography.typo2,
        backgroundColor: colors[mode].background.secondary,
        border: `1.5px solid ${colors[mode].border.border1}`,
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
