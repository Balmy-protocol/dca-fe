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
          '& .MuiMenu-paper': {
            backgroundColor: colors[mode].background.tertiary,
            border: colors[mode].border.border2,
            '& .MuiMenu-list': {
              padding: SPACING(3),
              gap: SPACING(0),
              '& .MuiDivider-root': {
                margin: `${SPACING(4)} ${SPACING(0)}`,
              },
              '& .MuiMenuItem-root': {
                padding: SPACING(3),
                backgroundColor: colors[mode].background.secondary,
                '&:hover': {
                  backgroundColor: colors[mode].background.emphasis,
                },
              },
              '& .Mui-selected': {
                padding: SPACING(3),
                backgroundColor: colors[mode].background.emphasis,
              },
            },
          },
        },
      },
    },
  },
});
