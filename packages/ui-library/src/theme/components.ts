import { Components } from '@mui/material';
import { MuiCssBaseline } from './baseline';
import { buildButtonVariant } from './button-variants';
import { SPACING } from './constants';
import { typography } from './typography';
import { baseColors } from './colors';

const lightModeVariants: Components = buildButtonVariant('light');

const darkModeVariants: Components = buildButtonVariant('dark');

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
        ...typography.bodySmall,
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        ...typography.bodySmall,
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
};

export const lightModeComponents = {
  ...baseComponents,
  ...lightModeVariants,
};

export const darkModeComponents = {
  ...baseComponents,
  ...darkModeVariants,
};
