// eslint-disable-next-line import/no-extraneous-dependencies
import { PaletteColor, PaletteColorOptions } from '@mui/material';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    displayXl: React.CSSProperties;
    displayLg: React.CSSProperties;
    displayMd: React.CSSProperties;
    displayXs: React.CSSProperties;
    bodyLarge: React.CSSProperties;
    body: React.CSSProperties;
    bodySmall: React.CSSProperties;
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
    bodyLarge?: React.CSSProperties;
    body?: React.CSSProperties;
    bodySmall?: React.CSSProperties;
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
    bodyLarge: true;
    body: true;
    bodySmall: true;
    bodyExtraSmall: true;
    bodySmallSmall: true;
    label: true;
    confirmationLoading: true;
  }
}
