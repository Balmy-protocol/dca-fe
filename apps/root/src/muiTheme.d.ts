// eslint-disable-next-line import/no-extraneous-dependencies
import '@mui/material';

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
    label: React.CSSProperties;
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
    label?: React.CSSProperties;
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
    label: true;
  }
}
