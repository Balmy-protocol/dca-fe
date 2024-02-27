import { Components } from '@mui/material';
import omit from 'lodash/omit';
import { MuiCssBaseline } from './baseline';
import { SPACING } from './constants';
import { baseColors } from './colors';
import merge from 'lodash/merge';

import { buildButtonVariant } from './variants/button-variants';
import { buildTableVariant } from './variants/table-variants';
import { buildTooltipVariant } from './variants/tooltip-variants';
import { buildInputBaseVariant } from './variants/input-base-variants';
import { buildDividerVariant } from './variants/divider-variants';
import { buildTypographyVariant } from './typography';
import { buildPaperVariant } from './variants/paper-variants';
import { buildSelectVariant } from './variants/select-variants';
import { buildSvgIconVariant } from './variants/svgicon-variants';
import { buildAccordionVariant } from './variants/accordion-variants';
import { buildChipVariant } from './variants/chip-variants';
import { buildToggleButtonGroupVariant } from './variants/toggle-button-group-variants';

const variantGenerators = [
  buildButtonVariant,
  buildTableVariant,
  buildTooltipVariant,
  buildDividerVariant,
  buildPaperVariant,
  buildInputBaseVariant,
  buildSelectVariant,
  buildSvgIconVariant,
  buildAccordionVariant,
  buildChipVariant,
  buildToggleButtonGroupVariant,
];

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
  MuiDialog: {
    styleOverrides: {
      container: {
        backdropFilter: 'blur(4px)',
      },
    },
  },
};

export const lightModeComponents = merge({}, baseComponents, lightModeVariants);

export const darkModeComponents = merge({}, baseComponents, darkModeVariants);
