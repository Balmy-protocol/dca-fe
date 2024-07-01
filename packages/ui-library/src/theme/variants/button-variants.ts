import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildButtonVariant = (mode: 'light' | 'dark'): Components => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        padding: `${SPACING(3)} ${SPACING(6)}`,
      },
      endIcon: {
        marginLeft: `0px`,
      },
      sizeLarge: {
        fontSize: '1rem',
        lineHeight: 2,
        padding: `${SPACING(3)} ${SPACING(6)}`,
      },
      sizeMedium: {
        padding: `${SPACING(2.25)} ${SPACING(4.5)}`,
      },
      sizeSmall: {
        padding: `${SPACING(1.5)} ${SPACING(3)}`,
        minWidth: SPACING(8),
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
          color: colors[mode].accent.accent600,
        },
      },
      containedPrimary: {
        backgroundColor: colors[mode].accent.primary,
        boxShadow: colors[mode].dropShadow.dropShadow200,
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
      containedSecondary: {
        backgroundColor: colors[mode].background.secondary,
        border: `1px solid ${colors[mode].accent.accent400}`,
        color: colors[mode].accentPrimary,
        boxShadow: 'none',
        fontWeight: 700,
        '&:disabled': {
          border: `1px solid ${colors[mode].typography.typo3}`,
          color: colors[mode].typography.typo1,
          opacity: 0.7,
        },
        '&:hover': {
          backgroundColor: colors[mode].accent.accent200,
          color: colors[mode].accent.accent600,
        },
        '&:active': {
          backgroundColor: colors[mode].accent.primary,
          color: colors[mode].accent.accent100,
        },
      },
      containedError: {
        '&:disabled': {
          border: `1px solid ${colors[mode].semanticBackground.error}`,
          color: colors[mode].semantic.error.darker,
          backgroundColor: colors[mode].semanticBackground.error,
          opacity: 0.7,
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
