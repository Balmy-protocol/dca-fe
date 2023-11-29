import { backgroundColors, borderColors, colors } from './colors';
import type { Components } from '@mui/material/styles';

export const buildButtonVariant = (mode: 'light' | 'dark'): Components => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
      },
      outlinedPrimary: {
        color: '#D0CCFF',
        borderColor: '#A399FF99',
      },
    },
    variants: [
      {
        props: { variant: 'contained', color: 'transparent' },
        style: {
          color: colors.default[mode],
          background: backgroundColors.transparent[mode].default,
          '&:hover': {
            background: backgroundColors.transparent[mode].hover,
          },
          '&:active': {
            background: backgroundColors.transparent[mode].hover,
          },
          backdropFilter: 'blur(6px)',
        },
      },
      {
        props: { variant: 'outlined', color: 'transparent' },
        style: {
          color: colors.default[mode],
          borderColor: borderColors.transparent[mode].default,
          background: backgroundColors.transparent[mode].default,
          '&:hover': {
            borderColor: borderColors.transparent[mode].hover,
          },
          '&:active': {
            borderColor: borderColors.transparent[mode].hover,
          },
          backdropFilter: 'blur(6px)',
        },
      },
      {
        props: { variant: 'text', color: 'transparent' },
        style: {
          color: colors.default[mode],
        },
      },
      {
        props: { variant: 'contained', color: 'default' },
        style: {
          color: colors.default[mode],
          borderColor: borderColors.default[mode].default,
          background: backgroundColors.default[mode].default,
          '&:hover': {
            borderColor: borderColors.default[mode].hover,
          },
          '&:active': {
            borderColor: borderColors.default[mode].hover,
          },
        },
      },
      {
        props: { variant: 'outlined', color: 'default' },
        style: {
          color: colors.default[mode],
          background: backgroundColors.default[mode].default,
          '&:hover': {
            background: backgroundColors.default[mode].hover,
          },
          '&:active': {
            background: backgroundColors.default[mode].hover,
          },
        },
      },
      {
        props: { variant: 'text', color: 'default' },
        style: {
          color: colors.default[mode],
        },
      },
      {
        props: { variant: 'contained', color: 'migrate' },
        style: {
          color: colors.migrate[mode],
          background: backgroundColors.migrate[mode].default,
          '&:hover': {
            background: backgroundColors.migrate[mode].hover,
          },
          '&:active': {
            background: backgroundColors.migrate[mode].hover,
          },
        },
      },
      {
        props: { variant: 'outlined', color: 'migrate' },
        style: {
          color: colors.pending[mode],
          borderColor: borderColors.migrate[mode].default,
          '&:hover': {
            borderColor: borderColors.migrate[mode].hover,
          },
          '&:active': {
            borderColor: borderColors.migrate[mode].hover,
          },
        },
      },
      {
        props: { variant: 'text', color: 'migrate' },
        style: {
          color: colors.migrate[mode],
        },
      },
      {
        props: { variant: 'contained', color: 'pending' },
        style: {
          color: colors.pending[mode],
          background: backgroundColors.pending[mode].default,
          '&:hover': {
            background: backgroundColors.pending[mode].hover,
          },
          '&:active': {
            background: backgroundColors.pending[mode].hover,
          },
        },
      },
      {
        props: { variant: 'outlined', color: 'pending' },
        style: {
          color: colors.pending[mode],
          borderColor: borderColors.pending[mode].default,
          '&:hover': {
            borderColor: borderColors.pending[mode].hover,
          },
          '&:active': {
            borderColor: borderColors.pending[mode].hover,
          },
        },
      },
      {
        props: { variant: 'text', color: 'pending' },
        style: {
          color: colors.pending[mode],
        },
      },
    ],
  },
});
