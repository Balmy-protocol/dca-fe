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
    h1Bold: React.CSSProperties;
    h2Bold: React.CSSProperties;
    h3Bold: React.CSSProperties;
    h4Bold: React.CSSProperties;
    h5Bold: React.CSSProperties;
    h6Bold: React.CSSProperties;
    bodySmallLabel: React.CSSProperties;
    bodySmallLabelBold: React.CSSProperties;
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
    h1Bold?: React.CSSProperties;
    h2Bold?: React.CSSProperties;
    h3Bold?: React.CSSProperties;
    h4Bold?: React.CSSProperties;
    h5Bold?: React.CSSProperties;
    h6Bold?: React.CSSProperties;
    bodySmallLabel?: React.CSSProperties;
    bodySmallLabelBold?: React.CSSProperties;
  }

  interface Palette {
    gradient: PaletteColor & {
      newsBanner: string;
    };
  }

  interface PaletteOptions {
    gradient?: PaletteColorOptions & {
      newsBanner: string;
    };
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
    h1Bold: true;
    h2Bold: true;
    h3Bold: true;
    h4Bold: true;
    h5Bold: true;
    h6Bold: true;
    bodySmallLabel: true;
    bodySmallLabelBold: true;
  }
}
