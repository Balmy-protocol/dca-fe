import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildTableVariant = (mode: 'light' | 'dark'): Components => ({
  MuiTableContainer: {
    styleOverrides: {
      root: {
        background: 'none',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.2s ease-in-out',
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
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-root': {
          borderBottom: `1px solid ${colors[mode].border.border1}`,
          paddingTop: SPACING(2),
          paddingBottom: SPACING(2),
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        borderBottom: 'none',
        '&:first-of-type': {
          paddingLeft: `${SPACING(6)}`,
        },
        '&:last-of-type': {
          paddingRight: `${SPACING(6)}`,
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
        padding: 0,
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
