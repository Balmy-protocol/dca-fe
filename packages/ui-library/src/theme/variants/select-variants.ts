import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildSelectVariant = (mode: 'light' | 'dark'): Components => ({
  MuiListSubheader: {
    styleOverrides: {
      root: {
        backgroundColor: 'transparent',
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      icon: {
        color: colors[mode].typography.typo2,
        '&.MuiSelect-iconStandard': {
          color: `${colors[mode].accentPrimary} !important`,
        },
      },
      standard: {
        paddingTop: `0 !important`,
        paddingBottom: `${SPACING(1)} !important`,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      root: {
        paddingTop: SPACING(2.5),
        paddingBottom: SPACING(2.5),
        paddingLeft: SPACING(3),

        '&.MuiSelect-MuiMenu': {
          top: SPACING(2),
          boxShadow: colors[mode].dropShadow.dropShadow200,
          '& .MuiMenu-paper .MuiMenu-list': {
            padding: `${SPACING(3)} !important`,
            gap: SPACING(0.5),
            '& .MuiMenuItem-root': {
              padding: SPACING(3),
              borderRadius: SPACING(2),
              border: `1px solid ${colors[mode].border.border1}`,
              backgroundColor: colors[mode].background.secondary,
              '&:hover': {
                backgroundColor: colors[mode].background.emphasis,
              },
            },
          },
          '& .Mui-selected': {
            padding: SPACING(3),
            backgroundColor: colors[mode].background.emphasis,
          },
        },
      },
      paper: {
        backgroundColor: colors[mode].background.modals,
        border: `1px solid ${colors[mode].border.border2}`,
      },
    },
  },
});
