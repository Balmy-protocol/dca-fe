import { ButtonOwnProps } from '@mui/material';
import type { Components } from '@mui/material/styles';
import { colors } from './colors';

type ButtonVariants = ButtonOwnProps['variant'];
type ButtonColors = ButtonOwnProps['color'];

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const disabledVariantColors: Record<
  'light' | 'dark',
  Partial<
    Record<ButtonVariants, Partial<Record<ButtonColors, { background?: string; color: string; border?: string }>>>
  >
> = {
  light: {
    text: {
      primary: {
        color: colors.light.violet.violet900,
      },
      secondary: {
        color: colors.light.aqua.aqua900,
      },
    },
    outlined: {
      primary: {
        color: colors.light.violet.violet900,
        border: `1px solid ${colors.light.violet.violet200}`,
      },
      secondary: {
        color: colors.light.aqua.aqua900,
        border: `1px solid ${colors.light.aqua.aqua200}`,
      },
    },
    contained: {
      primary: {
        background: colors.light.violet.violet200,
        color: colors.light.violet.violet900,
      },
      secondary: {
        background: colors.light.aqua.aqua200,
        color: colors.light.aqua.aqua900,
      },
    },
  },
  dark: {
    text: {
      primary: {
        color: colors.dark.violet.violet900,
      },
      secondary: {
        color: colors.dark.aqua.aqua900,
      },
    },
    outlined: {
      primary: {
        color: colors.dark.violet.violet900,
        border: `1px solid ${colors.dark.violet.violet200}`,
      },
      secondary: {
        color: colors.dark.aqua.aqua900,
        border: `1px solid ${colors.dark.aqua.aqua200}`,
      },
    },
    contained: {
      primary: {
        background: colors.dark.violet.violet200,
        color: colors.dark.violet.violet900,
      },
      secondary: {
        background: colors.dark.aqua.aqua200,
        color: colors.dark.aqua.aqua900,
      },
    },
  },
};

const buildButtonDisabledVariants = (mode: 'light' | 'dark', ownerState: ButtonOwnProps) => {
  const variant = ownerState.variant || 'contained';
  const color = ownerState.color || 'primary';

  const disabledModeColor = disabledVariantColors[mode];
  const disabledModeVariant = disabledModeColor && disabledModeColor[variant];
  const disabledModeVariantColor = disabledModeVariant && disabledModeVariant[color];

  if (disabledModeVariantColor) {
    return {
      '&.Mui-disabled': {
        background: disabledModeVariantColor.background,
        color: disabledModeVariantColor.color,
      },
    };
  }

  return {};
};

export const buildButtonVariant = (mode: 'light' | 'dark'): Components => ({
  MuiButton: {
    styleOverrides: {
      root: ({ ownerState }) => {
        return {
          ...buildButtonDisabledVariants(mode, ownerState),
          // common attributes
          textTransform: 'none',
        };
      },
    },
  },
});
