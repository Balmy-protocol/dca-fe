import { PaletteMode } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';
import { colors } from './colors';

// Temporary theme just to access breakpoints
const { breakpoints } = createTheme();

const baseBodyTypography = (mode: PaletteMode) => ({
  fontFamily: 'Inter',
  fontSize: '1rem', // 16/16
  fontStyle: 'normal',
  lineHeight: 1.21, // 19.36/16
  color: colors[mode].typography.typo2,
});

const baseBodySmallTypography = (mode: PaletteMode) => ({
  fontFamily: 'Inter',
  fontSize: '0.875rem', // 14/16
  fontStyle: 'normal',
  lineHeight: 1.21, // 17/14
  color: colors[mode].typography.typo3,
});

const baseBodyLargeTypography = (mode: PaletteMode) => ({
  fontFamily: 'Inter',
  fontSize: '1.125rem', // 18/16
  fontStyle: 'normal',
  lineHeight: 1.22, // 22/18
  color: colors[mode].typography.typo3,
});

const baseBodyExtraSmallTypography = (mode: PaletteMode) => ({
  fontFamily: 'Inter',
  fontSize: '0.75rem', // 12/16
  fontStyle: 'normal',
  color: colors[mode].typography.typo3,
});

const baseBodyExtraExtraSmallTypography = (mode: PaletteMode) => ({
  fontFamily: 'Inter',
  fontSize: '0.625rem', // 10/16
  fontStyle: 'normal',
  lineHeight: 1.2, // 12/10
  color: colors[mode].typography.typo3,
});

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
    [breakpoints.down('md')]: {
      fontSize: '2.25rem', // 36/16
      lineHeight: 1.2, // 43.2/36
      fontWeight: 700,
    },
  },
  h2Bold: {
    fontFamily: 'Inter',
    fontSize: '2rem', // 32/16
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 1.2, // 38.4/32
    letterSpacing: '-0.03125em', // -1/32
    [breakpoints.down('md')]: {
      fontSize: '1.875rem', // 30/16
      lineHeight: 1.2, // 36/30
    },
  },
  h3Bold: {
    fontFamily: 'Inter',
    fontSize: '1.5rem', // 24/16
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: 1.167, // 28/24
    letterSpacing: '-0.0417em', // -1/24
    color: colors[mode].typography.typo1,
    [breakpoints.down('md')]: {
      fontWeight: 600,
    },
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
  h6Bold: {
    fontFamily: 'Inter',
    fontSize: '1rem', // 16/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.21, // 19.36/16
    color: colors[mode].typography.typo2,
  },
  bodyLargeRegular: {
    ...baseBodyLargeTypography(mode),
    fontWeight: 400,
  },
  bodyLargeBold: {
    ...baseBodyLargeTypography(mode),
    fontWeight: 700,
  },
  bodyRegular: {
    ...baseBodyTypography(mode),
    fontWeight: 500,
  },
  bodySemibold: {
    ...baseBodyTypography(mode),
    fontWeight: 600,
  },
  bodyBoldNormalLineHeight: {
    ...baseBodyTypography(mode),
    fontWeight: 700,
  },
  bodyBold: {
    ...baseBodyTypography(mode),
    fontWeight: 700,
    lineHeight: 2, // 32/16
  },
  // Body Small
  bodySmallRegular: {
    ...baseBodySmallTypography(mode),
    fontWeight: 500,
  },
  bodySmallSemibold: {
    ...baseBodySmallTypography(mode),
    fontWeight: 600,
  },
  bodySmallBold: {
    ...baseBodySmallTypography(mode),
    fontWeight: 700,
  },
  // Body Extra Small
  bodyExtraSmall: {
    ...baseBodyExtraSmallTypography(mode),
    fontWeight: 500,
    lineHeight: 1.33, // 16/12
  },
  bodyExtraSmallBold: {
    ...baseBodyExtraSmallTypography(mode),
    fontWeight: 700,
    lineHeight: 1.167, // 14/12
  },
  // Body Extra Extra Small
  bodyExtraExtraSmall: {
    ...baseBodyExtraExtraSmallTypography(mode),
    fontWeight: 500,
  },
  bodyExtraExtraSmallBold: {
    ...baseBodyExtraExtraSmallTypography(mode),
    fontWeight: 700,
  },
  confirmationLoading: {
    fontFamily: 'Inter',
    fontSize: '3.25rem', // 52/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.21, // 63/52
    color: colors[mode].typography.typo2,
  },

  // Links
  linkRegular: {
    fontFamily: 'Inter',
    fontSize: '1rem', // 16/16
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 1.21, // 19.36/16
    color: colors[mode].accentPrimary,
  },
  linkSmall: {
    fontFamily: 'Inter',
    fontSize: '0.875rem', // 14/16
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 1.21, // 16.94/14
    color: colors[mode].accentPrimary,
  },
  // Labels
  labelExtraLarge: {
    fontFamily: 'Inter',
    fontSize: '1rem', // 16/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 'normal', // 16.94/14
    color: colors[mode].typography.typo2,
  },
  labelLarge: {
    fontFamily: 'Inter',
    fontSize: '0.875rem', // 14/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.21, // 16.94/14
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
  labelSemiBold: {
    fontFamily: 'Inter',
    fontSize: '0.75rem', // 12/16
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 1.33, // 16/12
    color: colors[mode].typography.typo2,
  },
});
