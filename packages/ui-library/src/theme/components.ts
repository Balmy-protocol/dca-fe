import { Components } from '@mui/material';
import omit from 'lodash/omit';
import { MuiCssBaseline } from './baseline';
import { SPACING } from './constants';
import merge from 'lodash/merge';

import { buildButtonVariant } from './variants/button-variants';
import { buildTableVariant } from './variants/table-variants';
import { buildTooltipVariant } from './variants/tooltip-variants';
import { buildInputBaseVariant } from './variants/input-base-variants';
import { buildDividerVariant } from './variants/divider-variants';
import { buildAppBarVariant } from './variants/appbar-variants';
import { buildTypographyVariant } from './typography';
import { buildPaperVariant } from './variants/paper-variants';
import { buildSelectVariant } from './variants/select-variants';
import { buildSvgIconVariant } from './variants/svgicon-variants';
import { buildAccordionVariant } from './variants/accordion-variants';
import { buildChipVariant } from './variants/chip-variants';
import { buildToggleButtonGroupVariant } from './variants/toggle-button-group-variants';
import { buildLinearProgressVariant } from './variants/linear-progress-variants';
import { buildCardVariant } from './variants/card-variants';
import { buildAlertVariant } from './variants/alert-variants';
import { buildDrawerVariant } from './variants/drawer-variants';
import { buildPopoverVariant } from './variants/popover-variants';
import { formControlLabelVariant } from './variants/form-control-label-variants';
import { buildCircularProgressVariant } from './variants/circular-progress-variants';
const variantGenerators = [
  buildDrawerVariant,
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
  buildCardVariant,
  buildLinearProgressVariant,
  buildAlertVariant,
  buildAppBarVariant,
  buildPopoverVariant,
  formControlLabelVariant,
  buildCircularProgressVariant,
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
      outlined: {
        outlineStyle: 'solid',
      },
    },
  },
  MuiList: {
    styleOverrides: {
      root: {
        padding: SPACING(3),
        gap: SPACING(1),
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
        padding: SPACING(2),
        ...omit(buildTypographyVariant('dark').bodySmallRegular, 'color'),
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        ...omit(buildTypographyVariant('dark').bodySmallRegular, 'color'),
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
        borderSpacing: `0px ${SPACING(2)} !important`,
        padding: 0,
        borderCollapse: 'separate',
        tableLayout: 'fixed',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        '&:first-of-type': {
          paddingLeft: `${SPACING(10)}`,
        },
        '&:last-of-type': {
          paddingRight: `${SPACING(10)}`,
        },
      },
    },
  },
  MuiTableSortLabel: {
    styleOverrides: {
      root: {
        gap: SPACING(1.5),
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
  MuiPopover: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'center',
        horizontal: 'right',
      },
      transformOrigin: {
        vertical: 'center',
        horizontal: 'left',
      },
      disableAutoFocus: true,
      slotProps: {
        root: {
          style: { top: SPACING(2) },
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        overflow: 'visible',
      },
      scroller: {
        overflow: 'visible !important',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        overflow: 'visible',
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      tag: {
        margin: 0,
        height: 'auto',
      },
    },
  },
  MuiRadio: {
    styleOverrides: {
      root: {
        padding: SPACING(1),

        '& .MuiSvgIcon-root': {
          fontSize: SPACING(6),
        },
      },
    },
  },
};

export const lightModeComponents = merge({}, baseComponents, lightModeVariants);

export const darkModeComponents = merge({}, baseComponents, darkModeVariants);
