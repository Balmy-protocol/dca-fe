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
        borderBottom: `1px solid ${colors[mode].border.border1}`,
        padding: `${SPACING(6)} ${SPACING(8)}`,
        background: 'none',
        '&:last-child': {
          borderBottom: 'none',
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
        marginTop: SPACING(6),
        borderTop: `1px solid ${colors[mode].border.border1}`,
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING(6),
      },
    },
  },
});
