import { Components } from '@mui/material';
import omit from 'lodash/omit';
import { MuiCssBaseline } from './baseline';
import { buildButtonVariant } from './button-variants';
import { SPACING } from './constants';
import { buildTypographyVariant } from './typography';
import { baseColors } from './colors';
import { buildTableVariant } from './table-variants';
import merge from 'lodash/merge';
import { buildTooltipVariant } from './tooltip-variants';

const variantGenerators = [buildButtonVariant, buildTableVariant, buildTooltipVariant];

const lightModeVariants: Components = variantGenerators.reduce((acc, generator) => merge(acc, generator('light')), {});

const darkModeVariants: Components = variantGenerators.reduce((acc, generator) => merge(acc, generator('dark')), {});

const baseComponents: Components = {
  MuiCssBaseline,
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        border: 'none',
      },
    },
  },
  MuiList: {
    styleOverrides: {
      root: {
        padding: SPACING(3),
        gap: SPACING(2),
        display: 'flex',
        flexDirection: 'column',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        display: 'flex',
        alignItems: 'center',
        gap: SPACING(2),
        padding: `${SPACING(1)} ${SPACING(2)}`,
        ...omit(buildTypographyVariant('dark').bodySmall, 'color'),
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        ...omit(buildTypographyVariant('dark').bodySmall, 'color'),
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: baseColors.dropShadow.dropShadow100,
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        display: 'flex',
        alignItems: 'center',
        gap: SPACING(1),
        cursor: 'pointer',
      },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        borderSpacing: `0px ${SPACING(4)} !important`,
        padding: `0px ${SPACING(4)}`,
        borderCollapse: 'separate',
        tableLayout: 'fixed',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      body: {
        borderBottom: 'none',
        ':first-child': {
          borderLeftStyle: 'solid',
          borderTopLeftRadius: SPACING(4),
          borderBottomLeftRadius: SPACING(4),
          borderColor: 'transparent',
        },
        ':last-child': {
          borderLeftStyle: 'solid',
          borderTopRightRadius: SPACING(4),
          borderBottomRightRadius: SPACING(4),
          borderColor: 'transparent',
        },
      },
    },
  },
};

export const lightModeComponents = merge({}, baseComponents, lightModeVariants);

export const darkModeComponents = merge({}, baseComponents, darkModeVariants);
