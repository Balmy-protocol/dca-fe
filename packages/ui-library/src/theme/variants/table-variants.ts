import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildTableVariant = (mode: 'light' | 'dark'): Components => ({
  MuiTableContainer: {
    styleOverrides: {
      root: {
        backgroundColor: 'transparent !important',
        border: `none !important`,
        '&.noSeparateRows': {
          backgroundColor: `${colors[mode].background.secondary} !important`,
          '.MuiTableRow-root': {
            backgroundColor: `inherit !important`,
          },
          '.MuiTableRow-head': {
            backgroundColor: `${colors[mode].background.secondary} !important`,
          },
          '.MuiTable-root': {
            borderSpacing: '0px !important',
          },
          '.MuiTableCell-root': {
            borderBottom: `1px solid ${colors[mode].border.border2}`,
            borderRadius: '0px',
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
