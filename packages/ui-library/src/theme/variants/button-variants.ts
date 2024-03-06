import type { Components } from '@mui/material/styles';
import { baseColors, colors } from '../colors';
import { DEFAULT_SPACING, SPACING } from '../constants';

export const buildButtonVariant = (mode: 'light' | 'dark'): Components => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        padding: `${SPACING(3)} ${SPACING(6)}`,
      },
      endIcon: {
        marginLeft: `${DEFAULT_SPACING}px`,
      },
      outlinedPrimary: {
        border: `1px solid ${colors[mode].accent.accent400}`,
        color: colors[mode].accent.primary,
        fontWeight: 700,
        '&:disabled': {
          border: `1px solid ${colors[mode].typography.typo4}`,
          color: colors[mode].typography.typo1,
          opacity: 0.5,
        },
        '&:hover': {
          backgroundColor: colors[mode].accent.accent200,
          border: `1px solid ${colors[mode].accent.accent400}`,
          color: colors[mode].accent.accent600,
        },
      },
      containedPrimary: {
        backgroundColor: colors[mode].accent.primary,
        boxShadow: baseColors.dropShadow.dropShadow200,
        color: colors[mode].accent.accent100,
        fontWeight: 700,
        '&:disabled': {
          border: `1px solid ${colors[mode].typography.typo3}`,
          color: colors[mode].typography.typo1,
          opacity: 0.7,
        },
        '&:hover': {
          backgroundColor: colors[mode].accent.accent600,
          color: colors[mode].accent.accent200,
        },
      },
      textPrimary: {
        color: colors[mode].accent.primary,
        fontWeight: 700,
        '&:disabled': {
          color: colors[mode].typography.typo1,
          opacity: 0.3,
        },
        '&:hover': {
          backgroundColor: colors[mode].accent.accent200,
          color: colors[mode].accent.accent600,
        },
      },
    },
  },
});
