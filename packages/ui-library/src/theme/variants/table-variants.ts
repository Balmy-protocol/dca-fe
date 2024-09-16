import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildTableVariant = (mode: 'light' | 'dark'): Components => ({
  MuiTableContainer: {
    styleOverrides: {
      root: {
        backgroundColor: `${colors[mode].background.quarteryNoAlpha}`,
        '&.noSeparateRows': {
          backgroundColor: `${colors[mode].background.secondary} !important`,
          '.MuiTableRow-root': {
            backgroundColor: `inherit !important`,
            borderRadius: 0,
            '&:last-of-type .MuiTableCell-root': {
              borderBottom: `none`,
            },
          },
          '.MuiTableRow-head': {
            backgroundColor: `${colors[mode].background.secondary} !important`,
            '.MuiTableCell-root': {
              borderBottom: `1px solid ${colors[mode].border.border2} !important`,
            },
          },
          '.MuiTable-root': {
            borderSpacing: '0px !important',
          },
          '.MuiTableCell-root': {
            borderBottom: `1px solid ${colors[mode].border.border2}`,
            borderRadius: 0,
            padding: SPACING(4),
            borderRadius: 0,
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
      hover: {
        '&:hover': {
          backgroundColor: `${colors[mode].background.tertiary} !important`,
        },
      },
      head: {
        backgroundColor: `${colors[mode].background.quarteryNoAlpha} !important`,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        borderBottom: 'none',
        '&:first-of-type': {
          paddingLeft: `${SPACING(10)}`,
        },
        '&:last-of-type': {
          paddingRight: `${SPACING(10)}`,
        },
      },
      body: {
        '&:first-of-type': {
          borderTopLeftRadius: SPACING(2),
          borderBottomLeftRadius: SPACING(2),
        },
        '&:last-of-type': {
          borderTopRightRadius: SPACING(2),
          borderBottomRightRadius: SPACING(2),
        },
      },
    },
  },
  MuiTablePagination: {
    defaultProps: {
      component: 'div',
      rowsPerPageOptions: [],
      labelDisplayedRows: () => '',
    },
    styleOverrides: {
      toolbar: {
        padding: `${SPACING(8)} 0 ${SPACING(4)}`,
      },
      spacer: {
        display: 'none',
      },
      displayedRows: {
        display: 'none',
      },
    },
  },
});
