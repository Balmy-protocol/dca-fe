import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';
import { buildTypographyVariant } from '../typography';

// Dont care about color variants for this
const typography = buildTypographyVariant('light');

export const buildButtonVariant = (mode: 'light' | 'dark'): Components => ({
  MuiButton: {
    styleOverrides: {
      root: {
        ...typography.bodyBold,
        textTransform: 'none',
        padding: `${SPACING(3)} ${SPACING(6)}`,
      },
      endIcon: {
        marginLeft: `0px`,
      },

      sizeLarge: {
        padding: `${SPACING(3)} ${SPACING(6)}`,
        minWidth: SPACING(37.5),
      },

      sizeMedium: {
        padding: `${SPACING(3)} ${SPACING(5)}`,
      },

      // Icon buttons and other small stuff
      sizeSmall: {
        padding: `${SPACING(1)} ${SPACING(2)}`,
        minWidth: 0,
      },

      // Pills
      outlinedInfo: {
        border: `1.5px solid ${colors[mode].border.border2}`,
        color: colors[mode].typography.typo3,
        backgroundColor: colors[mode].background.quartery,
        '&:hover': {
          backgroundColor: colors[mode].background.secondary,
          border: `1.5px solid ${colors[mode].border.border1}`,
          color: colors[mode].accent.primary,
        },
        '&:active': {
          backgroundColor: colors[mode].background.secondary,
          border: `1.5px solid ${colors[mode].border.border1}`,
          color: colors[mode].accent.primary,
        },
      },

      // Variants
      containedPrimary: {
        backgroundColor: colors[mode].accent.primary,
        boxShadow: colors[mode].dropShadow.dropShadow200,
        color: colors[mode].accent.accent100,
        '&:disabled': {
          color: colors[mode].accent.accent100,
          backgroundColor: colors[mode].accent.primary,
          opacity: 0.3,
        },
        '&:hover': {
          boxShadow: colors[mode].dropShadow.dropShadow200,
          color: colors[mode].accent.accent100,
          backgroundColor: colors[mode].accent.accent600,
          opacity: 0.9,
        },
      },

      outlinedPrimary: {
        border: `2px solid ${colors[mode].accent.accent400}`,
        color: colors[mode].accent.primary,
        '&:disabled': {
          border: `2px solid ${colors[mode].typography.typo5}`,
          color: colors[mode].typography.typo1,
          opacity: 0.5,
        },
        '&:hover': {
          backgroundColor: colors[mode].accent.accent200,
          color: colors[mode].accent.accent600,
        },
      },

      textPrimary: {
        padding: `${SPACING(2)} !important`,
        color: colors[mode].accent.primary,
        '&:disabled': {
          color: colors[mode].typography.typo1,
          opacity: 0.5,
        },
        '&:hover': {
          color: colors[mode].accent.accent600,
        },
      },

      containedError: {
        backgroundColor: colors[mode].semanticBackground.error,
        color: colors[mode].semantic.error.primary,
        '&:disabled': {
          border: `1px solid ${colors[mode].semanticBackground.error}`,
          color: colors[mode].semantic.error.darker,
          backgroundColor: colors[mode].semanticBackground.error,
          opacity: 0.7,
        },
      },
    },
  },
});
