import { PaletteColor, PaletteColorOptions } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    space: Record<'none' | 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07', string>;
  }

  interface ThemeOptions {
    space: Record<'none' | 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07', string>;
  }

  interface TypographyVariants {
    h1Bold: React.CSSProperties;
    h2Bold: React.CSSProperties;
    h3Bold: React.CSSProperties;
    h4Bold: React.CSSProperties;
    h5Bold: React.CSSProperties;
    h6Bold: React.CSSProperties;
    bodyLargeRegular: React.CSSProperties;
    bodyLargeBold: React.CSSProperties;
    bodyRegular: React.CSSProperties;
    bodySemibold: React.CSSProperties;
    bodyBold: React.CSSProperties;
    bodyBoldNormalLineHeight: React.CSSProperties;
    bodySmallRegular: React.CSSProperties;
    bodySmallSemibold: React.CSSProperties;
    bodySmallBold: React.CSSProperties;
    bodyExtraSmall: React.CSSProperties;
    bodyExtraSmallBold: React.CSSProperties;
    bodyExtraExtraSmall: React.CSSProperties;
    bodyExtraExtraSmallBold: React.CSSProperties;
    confirmationLoading: React.CSSProperties;
    linkRegular: React.CSSProperties;
    linkSmall: React.CSSProperties;
    labelLarge: React.CSSProperties;
    labelRegular: React.CSSProperties;
    labelSemiBold: React.CSSProperties;
    labelExtraLarge: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h1Bold?: React.CSSProperties;
    h2Bold?: React.CSSProperties;
    h3Bold?: React.CSSProperties;
    h4Bold?: React.CSSProperties;
    h5Bold?: React.CSSProperties;
    h6Bold?: React.CSSProperties;
    bodyLargeRegular?: React.CSSProperties;
    bodyLargeBold?: React.CSSProperties;
    bodyRegular?: React.CSSProperties;
    bodySemibold?: React.CSSProperties;
    bodyBold?: React.CSSProperties;
    bodyBoldNormalLineHeight?: React.CSSProperties;
    bodySmallRegular?: React.CSSProperties;
    bodySmallSemibold?: React.CSSProperties;
    bodySmallBold?: React.CSSProperties;
    bodyExtraSmall?: React.CSSProperties;
    bodyExtraSmallBold?: React.CSSProperties;
    bodyExtraExtraSmall?: React.CSSProperties;
    bodyExtraExtraSmallBold?: React.CSSProperties;
    confirmationLoading?: React.CSSProperties;
    linkRegular?: React.CSSProperties;
    linkSmall?: React.CSSProperties;
    labelLarge?: React.CSSProperties;
    labelRegular?: React.CSSProperties;
    labelSemiBold?: React.CSSProperties;
    labelExtraLarge?: React.CSSProperties;
  }

  interface Palette {
    gradient: PaletteColor & {
      earnWizard: string;
      newsBanner: string;
      tierLevel: string;
      rewards: string;
    };
    typo1: string;
    typo2: string;
    typo3: string;
    typo4: string;
    typo5: string;
  }

  interface PaletteOptions {
    gradient?: PaletteColorOptions & {
      earnWizard: string;
      newsBanner: string;
      rewards: string;
      tierLevel: string;
    };
    typo1: string;
    typo2: string;
    typo3: string;
    typo4: string;
    typo5: string;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h1Bold: true;
    h2Bold: true;
    h3Bold: true;
    h4Bold: true;
    h5Bold: true;
    h6Bold: true;
    bodyLargeRegular: true;
    bodyLargeBold: true;
    bodyRegular: true;
    bodySemibold: true;
    bodyBold: true;
    bodyBoldNormalLineHeight: true;
    bodySmallRegular: true;
    bodySmallSemibold: true;
    bodySmallBold: true;
    bodyExtraSmall: true;
    bodyExtraSmallBold: true;
    bodyExtraExtraSmall: true;
    bodyExtraExtraSmallBold: true;
    confirmationLoading: true;
    linkRegular: true;
    linkSmall: true;
    labelLarge: true;
    labelRegular: true;
    labelSemiBold: true;
    labelExtraLarge: true;
  }
}
