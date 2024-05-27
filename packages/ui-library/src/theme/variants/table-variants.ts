import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildTableVariant = (mode: 'light' | 'dark'): Components => ({
  MuiTableContainer: {
    styleOverrides: {
      root: {
        backgroundColor: 'transparent !important',
        '.MuiTableCell-root': {
          borderBottom: `1px solid ${colors[mode].border.border2}`,
          borderRadius: '0px',
          '&:first-of-type': {
            paddingLeft: `${SPACING(10)}`,
            borderTopLeftRadius: SPACING(2),
            borderBottomLeftRadius: SPACING(2),
          },
          '&:last-of-type': {
            paddingRight: `${SPACING(10)}`,
            borderTopRightRadius: SPACING(2),
            borderBottomRightRadius: SPACING(2),
          },
        },
        '.MuiTableRow-root': {},
        '&.noSeparateRows': {
          backgroundColor: `${colors[mode].background.secondary} !important`,
          '.MuiTableRow-root': {
            backgroundColor: `inherit !important`,
            borderRadius: 0,
          },
          '.MuiTableRow-head': {
            backgroundColor: `${colors[mode].background.secondary} !important`,
          },
          '.MuiTable-root': {
            borderSpacing: '0px !important',
          },
          '.MuiTableCell-root': {
            padding: SPACING(4),
          },
        },
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        backgroundColor: `${colors[mode].background.secondary} !important`,
      },
      head: {
        backgroundColor: `${colors[mode].background.quarteryNoAlpha} !important`,
      },
    },
  },
});
