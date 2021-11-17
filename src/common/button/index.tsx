import React from 'react';
import styled from 'styled-components';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const colors = {
  primary: '#239F33',
  default: '#333333',
  white: '#333333',
  secondary: '#FAFAFA',
  tertiary: '#0088CC',
  warning: '#FAFAFA',
  error: '#F50000',
  pending: '#CC00AB',
};

const backgroundColors = {
  primary: {
    default: '#2CC941',
    hover: '#219130',
  },
  default: {
    default: '#D9D9D9',
    hover: '#c9c9c9',
  },
  white: {
    default: '#FFFFFF',
    hover: '#efefef',
  },
  secondary: {
    default: '#00A3F5',
    hover: '#0294de',
  },
  tertiary: {
    default: '#DCEFF9',
    hover: '#ccdee8',
  },
  warning: {
    default: '#F5B000',
    hover: '#db9e00',
  },
  error: {
    default: '#F9DCDC',
    hover: '#e6caca',
  },
  pending: {
    default: '#F9DCF4',
    hover: '#e0c5dc',
  },
};

const borderColors = {
  primary: {
    default: '#2CC941',
    hover: '#219130',
  },
  default: {
    default: '#D9D9D9',
    hover: '#c9c9c9',
  },
  white: {
    default: '#FFFFFF',
    hover: '#efefef',
  },
  secondary: {
    default: '#00A3F5',
    hover: '#0294de',
  },
  tertiary: {
    default: '#DCEFF9',
    hover: '#ccdee8',
  },
  warning: {
    default: '#F5B000',
    hover: '#db9e00',
  },
  error: {
    default: '#F9DCDC',
    hover: '#e6caca',
  },
  pending: {
    default: '#F9DCF4',
    hover: '#e0c5dc',
  },
};

const StyledDisabledFontButton = styled(Button)`
  text-transform: none;
`;

const PrimaryButton = withStyles({
  text: {
    color: colors.primary,
  },
  outlined: {
    color: colors.primary,
    borderColor: borderColors.primary.default,
    '&:hover': {
      borderColor: borderColors.primary.hover,
    },
    '&:active': {
      borderColor: borderColors.primary.hover,
    },
  },
  contained: {
    color: colors.secondary,
    backgroundColor: backgroundColors.primary.default,
    '&:hover': {
      backgroundColor: backgroundColors.primary.hover,
    },
    '&:active': {
      backgroundColor: backgroundColors.primary.hover,
    },
  },
})(StyledDisabledFontButton);

const SecondaryButton = withStyles({
  text: {
    color: backgroundColors.secondary.default,
  },
  outlined: {
    color: borderColors.secondary.default,
    borderColor: borderColors.secondary.default,
    '&:hover': {
      borderColor: borderColors.secondary.hover,
    },
    '&:active': {
      borderColor: borderColors.secondary.hover,
    },
  },
  contained: {
    color: colors.secondary,
    backgroundColor: backgroundColors.secondary.default,
    '&:hover': {
      backgroundColor: backgroundColors.secondary.hover,
    },
    '&:active': {
      backgroundColor: backgroundColors.secondary.hover,
    },
  },
})(StyledDisabledFontButton);

const TertiaryButton = withStyles({
  text: {
    color: colors.tertiary,
  },
  outlined: {
    color: borderColors.tertiary.default,
    borderColor: borderColors.tertiary.default,
    '&:hover': {
      borderColor: borderColors.tertiary.hover,
    },
    '&:active': {
      borderColor: borderColors.tertiary.hover,
    },
  },
  contained: {
    color: colors.tertiary,
    backgroundColor: backgroundColors.tertiary.default,
    '&:hover': {
      backgroundColor: backgroundColors.tertiary.hover,
    },
    '&:active': {
      backgroundColor: backgroundColors.tertiary.hover,
    },
  },
})(StyledDisabledFontButton);

const DefaultButton = withStyles({
  text: {
    color: colors.default,
  },
  outlined: {
    color: colors.default,
    borderColor: borderColors.default.default,
    '&:hover': {
      borderColor: borderColors.default.hover,
    },
    '&:active': {
      borderColor: borderColors.default.hover,
    },
  },
  contained: {
    color: colors.default,
    backgroundColor: backgroundColors.default.default,
    '&:hover': {
      backgroundColor: backgroundColors.default.hover,
    },
    '&:active': {
      backgroundColor: backgroundColors.default.hover,
    },
  },
})(StyledDisabledFontButton);

const WhiteButton = withStyles({
  text: {
    color: colors.white,
  },
  outlined: {
    color: colors.white,
    borderColor: borderColors.white.default,
    '&:hover': {
      borderColor: borderColors.white.hover,
    },
    '&:active': {
      borderColor: borderColors.white.hover,
    },
  },
  contained: {
    color: colors.white,
    backgroundColor: backgroundColors.white.default,
    '&:hover': {
      backgroundColor: backgroundColors.white.hover,
    },
    '&:active': {
      backgroundColor: backgroundColors.white.hover,
    },
  },
})(StyledDisabledFontButton);

const ErrorButton = withStyles({
  text: {
    color: colors.error,
  },
  outlined: {
    color: colors.error,
    borderColor: borderColors.error.default,
    '&:hover': {
      borderColor: borderColors.error.hover,
    },
    '&:active': {
      borderColor: borderColors.error.hover,
    },
  },
  contained: {
    color: colors.error,
    backgroundColor: backgroundColors.error.default,
    '&:hover': {
      backgroundColor: backgroundColors.error.hover,
    },
    '&:active': {
      backgroundColor: backgroundColors.error.hover,
    },
  },
})(StyledDisabledFontButton);

const WarningButton = withStyles({
  text: {
    color: colors.warning,
  },
  outlined: {
    color: colors.warning,
    borderColor: borderColors.warning.default,
    '&:hover': {
      borderColor: borderColors.warning.hover,
    },
    '&:active': {
      borderColor: borderColors.warning.hover,
    },
  },
  contained: {
    color: colors.warning,
    backgroundColor: backgroundColors.warning.default,
    '&:hover': {
      backgroundColor: backgroundColors.warning.hover,
    },
    '&:active': {
      backgroundColor: backgroundColors.warning.hover,
    },
  },
})(StyledDisabledFontButton);

const PendingButton = withStyles({
  text: {
    color: colors.pending,
  },
  outlined: {
    color: colors.pending,
    borderColor: borderColors.pending.default,
    '&:hover': {
      borderColor: borderColors.pending.hover,
    },
    '&:active': {
      borderColor: borderColors.pending.hover,
    },
  },
  contained: {
    color: colors.pending,
    backgroundColor: backgroundColors.pending.default,
    '&:hover': {
      backgroundColor: backgroundColors.pending.hover,
    },
    '&:active': {
      backgroundColor: backgroundColors.pending.hover,
    },
  },
})(StyledDisabledFontButton);

const ButtonTypes = {
  primary: PrimaryButton,
  secondary: SecondaryButton,
  default: DefaultButton,
  white: WhiteButton,
  error: ErrorButton,
  warning: WarningButton,
  tertiary: TertiaryButton,
  pending: PendingButton,
};

interface CustomButtonProps extends Omit<ButtonProps, 'color'> {
  color: keyof typeof ButtonTypes;
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, color, ...rest }: CustomButtonProps) => {
  const ButtonToRender = ButtonTypes[color];

  return <ButtonToRender {...rest}>{children}</ButtonToRender>;
};

export default CustomButton;
