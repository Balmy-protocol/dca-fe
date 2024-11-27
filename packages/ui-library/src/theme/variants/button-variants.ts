import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';
import { buildTypographyVariant } from '../typography';
import omit from 'lodash/omit';

// Dont care about color variants for this
const typography = buildTypographyVariant('light');

export const buildButtonVariant = (mode: 'light' | 'dark'): Components => ({
  MuiButton: {
    styleOverrides: {
      root: {
        ...omit(typography.bodyBold, 'color'),
        textTransform: 'none',
        padding: `${SPACING(3)} ${SPACING(6)}`,
        ':has(> .MuiButton-endIcon)': {
          padding: `${SPACING(2.5)} ${SPACING(6)}`,
        },
      },
      endIcon: {
        marginLeft: '2px',
        '& > *:first-child': {
          fontSize: '1.25rem', // 20/16
          lineHeight: 1.5, // 24/16
        },
      },

      sizeLarge: {
        padding: `${SPACING(3)} ${SPACING(6)}`,
        minWidth: SPACING(37.5),
      },

      sizeMedium: {
        ...omit(typography.bodySmallBold, 'color'),
        padding: `${SPACING(3)} ${SPACING(5)}`,
      },

      // Icon buttons and other small stuff
      sizeSmall: {
        ...omit(typography.bodySmallBold, 'color'),
        padding: SPACING(2),
        minWidth: 0,
        borderRadius: SPACING(1),
      },

      // Pills
      outlinedInfo: {
        padding: `${SPACING(1)} ${SPACING(3)} !important`,
        border: `1.5px solid ${colors[mode].border.border2}`,
        color: colors[mode].typography.typo3,
        backgroundColor: colors[mode].background.quartery,
        backdropFilter: 'blur(30px)',
        borderRadius: `${SPACING(25)} !important`,
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

      containedSecondary: {
        backgroundColor: colors[mode].background.secondary,
        boxShadow: 'none',
        color: colors[mode].typography.typo3,
        '&:disabled': {
          color: colors[mode].accent.accent100,
          backgroundColor: colors[mode].accent.primary,
          opacity: 0.3,
          boxShadow: 'none',
        },
        '&:hover': {
          color: colors[mode].accent.accent100,
          backgroundColor: colors[mode].accent.accent600,
          opacity: 0.9,
          boxShadow: 'none',
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
          border: `2px solid ${colors[mode].accent.accent400}`,
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
        backgroundColor: colors[mode].semantic.error.darker,
        color: colors[mode].accent.accent100,
        '&:disabled': {
          color: colors[mode].accent.accent100,
          backgroundColor: colors[mode].semantic.error.red800,
          opacity: 0.7,
        },
        '&:hover': {
          backgroundColor: colors[mode].semantic.error.red800,
          color: colors[mode].accent.accent100,
        },
      },
    },
  },
});
