import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';
import { buildTypographyVariant } from '../typography';

export const buildAlertVariant = (mode: 'light' | 'dark'): Components => ({
  MuiAlert: {
    styleOverrides: {
      standard: {
        background: colors[mode].background.secondary,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        gap: SPACING(2),
        ...buildTypographyVariant(mode).bodyRegular,
      },
      standardSuccess: {
        borderColor: colors[mode].semantic.success.primary,
        '.MuiAlert-icon': {
          color: colors[mode].semantic.success.darker,
        },
      },
      standardError: {
        borderColor: colors[mode].semantic.error.primary,
        '.MuiAlert-icon': {
          color: colors[mode].semantic.error.darker,
        },
      },
      standardInfo: {
        borderColor: colors[mode].semantic.informative.darker,
        '.MuiAlert-icon': {
          color: colors[mode].semantic.informative.darker,
        },
      },
      standardWarning: {
        borderColor: colors[mode].semantic.warning.primary,
        '.MuiAlert-icon': {
          color: colors[mode].semantic.warning.darker,
        },
      },
    },
  },
});
