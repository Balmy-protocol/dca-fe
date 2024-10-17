import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildInputBaseVariant = (mode: 'light' | 'dark'): Components => ({
  MuiInputBase: {
    styleOverrides: {
      root: {
        padding: `${SPACING(3)} !important`,
        fontWeight: '600',
        display: 'flex',
        gap: SPACING(2),
        backgroundColor: colors[mode].background.secondary,
        '&:hover': {
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: `${colors[mode].accentPrimary} !important`,
          },
        },
        '& .MuiSvgIcon-root': {
          transition: 'color 200ms',
          color: colors[mode].typography.typo5,
        },
        '&.Mui-disabled': {
          opacity: '.5',
          input: {
            WebkitTextFillColor: colors[mode].typography.typo1,
          },
        },
        '&.Mui-focused': {
          '& .MuiSvgIcon-root': {
            color: `${colors[mode].typography.typo3} !important`,
          },
        },
      },
      input: {
        padding: '0 !important',
      },
      sizeSmall: {
        padding: `${SPACING(2)} ${SPACING(3)} !important`,
      },
      focused: {
        borderColor: colors[mode].accentPrimary,
        backgroundColor: colors[mode].background.tertiary,
        '& .MuiSvgIcon-root': {
          color: `${colors[mode].typography.typo3} !important`,
        },
        borderWidth: '1.5px',
      },
      disabled: {
        opacity: '.5',
        input: {
          WebkitTextFillColor: colors[mode].typography.typo1,
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: SPACING(2),
        backgroundColor: colors[mode].background.secondary,
        color: colors[mode].typography.typo1,
      },
      notchedOutline: {
        transition: 'border 200ms',
        borderColor: colors[mode].border.border1,
      },
    },
  },
});
