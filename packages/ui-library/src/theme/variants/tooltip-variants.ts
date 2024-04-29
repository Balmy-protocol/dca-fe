import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildTooltipVariant = (mode: 'light' | 'dark'): Components => ({
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: colors[mode].background.emphasis,
        border: `1px solid ${colors[mode].border.border1}`,
        borderRadius: SPACING(2),
        padding: SPACING(3),
        boxShadow: colors[mode].dropShadow.dropShadow200,
        color: colors[mode].typography.typo2,
      },
      arrow: {
        color: colors[mode].background.emphasis,
        '&:before': {
          border: `1px solid ${colors[mode].border.border1}`,
        },
      },
    },
    defaultProps: {
      placement: 'top',
      arrow: true,
    },
  },
});
