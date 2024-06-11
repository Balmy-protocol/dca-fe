import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildAccordionVariant = (mode: 'light' | 'dark'): Components => ({
  MuiAccordion: {
    defaultProps: {
      elevation: 0,
      disableGutters: true,
    },
    styleOverrides: {
      root: {
        padding: SPACING(6),
        borderRadius: `${SPACING(4)} !important`,
        background: colors[mode].background.quartery,
        '&:last-child': {
          borderBottom: 'none',
        },
        '&:before': {
          opacity: 0,
        },
      },
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        padding: 0,
        '& .MuiSvgIcon-root': {
          color: colors[mode].typography.typo2,
        },
        minHeight: 0,
      },
      content: {
        margin: 0,
      },
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        padding: `${SPACING(6)} 0 0`,
        marginTop: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING(6),
      },
    },
  },
});
