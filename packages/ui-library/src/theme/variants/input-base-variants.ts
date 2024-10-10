import type { Components } from '@mui/material/styles';
import { colors } from '../colors';
import { SPACING } from '../constants';

export const buildInputBaseVariant = (mode: 'light' | 'dark'): Components => ({
  MuiInputBase: {
    styleOverrides: {
      root: {
        fontWeight: '600',
        display: 'flex',
        gap: SPACING(2),
        '&:hover': {
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: `${colors[mode].accentPrimary} !important`,
          },
        },
        flex: 1,
      },
      inputSizeSmall: {
        paddingTop: `${SPACING(2.5)} !important`,
        paddingBottom: `${SPACING(2.5)} !important`,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        alignSelf: 'stretch',
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        '&::before': {
          borderBottom: `2px solid ${colors[mode].accent.primary}`,
        },
        height: 'auto',
      },
      nativeInput: {
        border: '0px',
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: SPACING(2),
        color: colors[mode].typography.typo1,

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
      notchedOutline: {
        transition: 'border 200ms',
        borderColor: colors[mode].border.border1,
      },

      input: {
        padding: '0 !important',
        paddingRight: `${SPACING(5)} !important`,
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
});
