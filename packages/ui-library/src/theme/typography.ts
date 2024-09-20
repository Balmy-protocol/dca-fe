import { PaletteMode } from '@mui/material';
import { TypographyOptions } from '@mui/material/styles/createTypography';
import { colors } from './colors';

export const buildTypographyVariant = (mode: PaletteMode): TypographyOptions => ({
  fontFamily: "'Inter', sans-serif",
  h1Bold: {
    fontFamily: 'Inter',
    fontSize: '2.5rem', // 40/16
    fontStyle: 'normal',
    fontWeight: 800,
    lineHeight: 1.2, // 48/40
    letterSpacing: '-0.025em', // -1/40
    color: colors[mode].typography.typo1,
  },
  h2Bold: {
    fontFamily: 'Inter',
    fontSize: '2rem', // 32/16
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 1.25, // 40/32
    letterSpacing: '-0.03125em', // -1/32
  },
  h3Bold: {
    fontFamily: 'Inter',
    fontSize: '1.5rem', // 24/16
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 1.167, // 28/24
    letterSpacing: '-0.0417em', // -1/24
    color: colors[mode].typography.typo1,
  },
  h4Bold: {
    fontFamily: 'Inter',
    fontSize: '1.25rem', // 20/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.12, // 24/20
  },
  h5Bold: {
    fontFamily: 'Inter',
    fontSize: '1.125rem', // 18/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.22, // 22/18
    color: colors[mode].typography.typo2,
  },
  bodyLargeRegular: {
    fontFamily: 'Inter',
    fontSize: '1.125rem', // 18/16
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 1.22, // 22/18
    color: colors[mode].typography.typo3,
  },
  bodyRegular: {
    fontFamily: 'Inter',
    fontSize: '1rem', // 16/16
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 1.35, // 21.6/16
    color: colors[mode].typography.typo2,
  },
  bodySemibold: {
    fontFamily: 'Inter',
    fontSize: '1rem', // 16/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.35, // 21.6/16
    color: colors[mode].typography.typo2,
  },
  bodyBold: {
    fontFamily: 'Inter',
    fontSize: '1rem', // 16/16
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 2, // 32/16
    color: colors[mode].typography.typo2,
  },
  // Body Small
  bodySmallRegular: {
    fontFamily: 'Inter',
    fontSize: '0.875rem', // 14/16
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 1.1428, // 16/14
    color: colors[mode].typography.typo3,
  },
  bodySmallSemibold: {
    fontFamily: 'Inter',
    fontSize: '0.875rem', // 14/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.28571, // 18/14
    color: colors[mode].typography.typo3,
  },
  bodySmallBold: {
    fontFamily: 'Inter',
    fontSize: '0.875rem', // 14/16
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 1.28571, // 18/14
    color: colors[mode].typography.typo3,
  },
  // Body Extra Small
  bodyExtraSmall: {
    fontFamily: 'Inter',
    fontSize: '0.75rem', // 12/16
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 1, // 12/12
  },
  bodyExtraSmallBold: {
    fontFamily: 'Inter',
    fontSize: '0.75rem', // 12/16
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 1, // 12/12
  },
  // Body Extra Extra Small
  bodyExtraExtraSmall: {
    fontFamily: 'Inter',
    fontSize: '0.625rem', // 10/16
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 1.2, // 12/10
  },
  bodyExtraExtraSmallBold: {
    fontFamily: 'Inter',
    fontSize: '0.625rem', // 10/16
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 1.2, // 12/10
  },
  confirmationLoading: {
    fontFamily: 'Inter',
    fontSize: '3.25rem', // 52/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.21, // 63/52
    textDecoration: 'underline',
    color: colors[mode].typography.typo2,
  },

  // Links
  linkRegular: {
    fontFamily: 'Inter',
    fontSize: '1rem', // 16/16
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 1.5, // 24/16
    textDecoration: 'underline',
    color: colors[mode].accentPrimary,
  },
  linkSmall: {
    fontFamily: 'Inter',
    fontSize: '0.875rem', // 14/16
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 1.5, // 21/14
    color: colors[mode].accentPrimary,
  },
  // Labels
  labelLarge: {
    fontFamily: 'Inter',
    fontSize: '0.875rem', // 14/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.3, // 18.2/14
    color: colors[mode].typography.typo2,
  },
  labelRegular: {
    fontFamily: 'Inter',
    fontSize: '0.75rem', // 12/16
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 1.33, // 16/12
    color: colors[mode].typography.typo3,
  },
});
