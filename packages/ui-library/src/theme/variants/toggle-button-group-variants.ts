import type { Components } from '@mui/material/styles';
import { baseColors, colors } from '../colors';
import { SPACING } from '../constants';

export const buildToggleButtonGroupVariant = (mode: 'light' | 'dark'): Components => ({
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        gap: SPACING(2),
        border: 'none',
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        padding: `${SPACING(2.5)} ${SPACING(3)}`,
        textTransform: 'none',
        transition: 'background-color 300ms, border-color 300ms',
        background: colors[mode].background.secondary,
        '&&&.MuiToggleButton-root': {
          border: `1px solid ${colors[mode].border.border1}`,
          borderRadius: `${SPACING(2)}`,
        },
        ':hover': {
          background: colors[mode].background.tertiary,
        },
        '&&&.Mui-selected': {
          boxShadow: baseColors.dropShadow.dropShadow100,
          borderColor: `${colors[mode].accentPrimary}`,
          background: colors[mode].background.tertiary,
          '& .MuiTypography-root': {
            fontWeight: 700,
            color: colors[mode].accentPrimary,
          },
        },
      },
    },
  },
});
