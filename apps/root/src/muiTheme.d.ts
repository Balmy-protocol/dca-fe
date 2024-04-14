// eslint-disable-next-line import/no-extraneous-dependencies
import { PaletteColor, PaletteColorOptions } from '@mui/material';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    displayXl: React.CSSProperties;
    displayLg: React.CSSProperties;
    displayMd: React.CSSProperties;
    displayXs: React.CSSProperties;
    bodyLargeRegular: React.CSSProperties;
    bodyLargeBold: React.CSSProperties;
    bodyRegular: React.CSSProperties;
    bodyBold: React.CSSProperties;
    bodySemibold: React.CSSProperties;
    bodySmallRegular: React.CSSProperties;
    bodySmallBold: React.CSSProperties;
    bodySmallSemibold: React.CSSProperties;
    bodyExtraSmall: React.CSSProperties;
    bodySmallSmall: React.CSSProperties;
    label: React.CSSProperties;
    confirmationLoading: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    displayXl?: React.CSSProperties;
    displayLg?: React.CSSProperties;
    displayMd?: React.CSSProperties;
    displayXs?: React.CSSProperties;
    bodyLargeRegular?: React.CSSProperties;
    bodyLargeBold?: React.CSSProperties;
    bodyRegular?: React.CSSProperties;
    bodyBold?: React.CSSProperties;
    bodySemibold?: React.CSSProperties;
    bodySmallRegular?: React.CSSProperties;
    bodySmallBold?: React.CSSProperties;
    bodySmallSemibold?: React.CSSProperties;
    bodyExtraSmall?: React.CSSProperties;
    bodySmallSmall?: React.CSSProperties;
    label?: React.CSSProperties;
    confirmationLoading?: React.CSSProperties;
  }

  interface Palette {
    gradient: PaletteColor;
  }

  interface PaletteOptions {
    gradient?: PaletteColorOptions;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    displayXl: true;
    displayLg: true;
    displayMd: true;
    displayXs: true;
    bodyLargeRegular: true;
    bodyLargeBold: true;
    bodyRegular: true;
    bodyBold: true;
    bodySemibold: true;
    bodySmallRegular: true;
    bodySmallBold: true;
    bodySmallSemibold: true;
    bodyExtraSmall: true;
    bodySmallSmall: true;
    label: true;
    confirmationLoading: true;
  }
}
