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
  MuiMenu: {
    styleOverrides: {
      root: {
        '&.MuiSelect-MuiMenu': {
          top: SPACING(2),
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
