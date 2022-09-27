import React from 'react';
import styled from 'styled-components';
import Button, { ButtonProps } from '@mui/material/Button';
import { withStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const colors = {
  primary: {
    light: '#239F33',
    dark: '#239F33',
  },
  default: {
    light: '#333333',
    dark: '#ffffff',
  },
  white: {
    light: '#333333',
    dark: '#ffffff',
  },
  secondary: {
    light: '#FFFFFF',
    dark: '#FFFFFF',
  },
  migrate: {
    light: '#FFFFFF',
    dark: '#FFFFFF',
  },
  tertiary: {
    light: '#0088CC',
    dark: '#FFFFFF',
  },
  warning: {
    light: '#FAFAFA',
    dark: '#FAFAFA',
  },
  error: {
    light: '#F50000',
    dark: '#ffffff',
  },
  pending: {
    light: '#CC00AB',
    dark: '#CC00AB',
  },
};

const backgroundColors = {
  primary: {
    light: {
      default: '#2CC941',
      hover: '#219130',
    },
    dark: {
      default: '#2CC941',
      hover: '#219130',
    },
  },
  default: {
    light: {
      default: '#ffffff',
      hover: '#c9c9c9',
    },
    dark: {
      default: '#292929',
      hover: '#525252',
    },
  },
  transparent: {
    light: {
      default: 'rgba(255, 255, 255, 0.1)',
      hover: '#c9c9c9',
    },
    dark: {
      default: 'rgba(255, 255, 255, 0.1)',
      hover: '#525252',
    },
  },
  white: {
    light: {
      default: '#FFFFFF',
      hover: '#efefef',
    },
    dark: {
      default: '#424242',
      hover: '#525252',
    },
  },
  secondary: {
    light: {
      default: '#00A3F5',
      hover: '#0294de',
    },
    dark: {
      default: '#3076F6',
      hover: '#3c7bed',
    },
  },
  migrate: {
    light: {
      default: '#00A3F5',
      hover: '#0294de',
    },
    dark: {
      default: 'linear-gradient(90deg, #3076F6 0%, #B518FF 123.4%)',
      hover: 'linear-gradient(90deg, #5484dc 0%, #b850e9 123.4%)',
    },
  },
  tertiary: {
    light: {
      default: '#DCEFF9',
      hover: '#ccdee8',
    },
    dark: {
      default: '#0492dd',
      hover: '#39a4df',
    },
  },
  warning: {
    light: {
      default: '#F5B000',
      hover: '#db9e00',
    },
    dark: {
      default: '#9d7100',
      hover: '#db9e00',
    },
  },
  error: {
    light: {
      default: '#F9DCDC',
      hover: '#e6caca',
    },
    dark: {
      default: '#FF5359',
      hover: '#d55858',
    },
  },
  pending: {
    light: {
      default: '#F9DCF4',
      hover: '#e0c5dc',
    },
    dark: {
      default: '#F9DCF4',
      hover: '#e0c5dc',
    },
  },
};

const borderColors = {
  primary: {
    light: {
      default: '#2CC941',
      hover: '#219130',
    },
    dark: {
      default: '#2CC941',
      hover: '#219130',
    },
  },
  default: {
    light: {
      default: '#D9D9D9',
      hover: '#c9c9c9',
    },
    dark: {
      default: 'rgba(255,255,255,0.5)',
      hover: 'rgba(255,255,255,0.6)',
    },
  },
  transparent: {
    light: {
      default: '#D9D9D9',
      hover: '#c9c9c9',
    },
    dark: {
      default: 'transparent',
      hover: 'transparent',
    },
  },
  white: {
    light: {
      default: '#FFFFFF',
      hover: '#efefef',
    },
    dark: {
      default: 'rgba(255,255,255,0.1)',
      hover: 'rgba(255,255,255,0.2)',
    },
  },
  secondary: {
    light: {
      default: '#00A3F5',
      hover: '#0294de',
    },
    dark: {
      default: '#00A3F5',
      hover: '#0294de',
    },
  },
  migrate: {
    light: {
      default: '#00A3F5',
      hover: '#0294de',
    },
    dark: {
      default: '#00A3F5',
      hover: '#0294de',
    },
  },
  tertiary: {
    light: {
      default: '#DCEFF9',
      hover: '#ccdee8',
    },
    dark: {
      default: '#DCEFF9',
      hover: '#ccdee8',
    },
  },
  warning: {
    light: {
      default: '#F5B000',
      hover: '#db9e00',
    },
    dark: {
      default: '#9d7100',
      hover: '#db9e00',
    },
  },
  error: {
    light: {
      default: '#F9DCDC',
      hover: '#e6caca',
    },
    dark: {
      default: '#9d3f3f',
      hover: '#d55858',
    },
  },
  pending: {
    light: {
      default: '#F9DCF4',
      hover: '#e0c5dc',
    },
    dark: {
      default: '#F9DCF4',
      hover: '#e0c5dc',
    },
  },
};

const StyledDisabledFontButton = styled(Button)`
  text-transform: none;
`;

const PrimaryButton = withStyles((theme: Theme) => ({
  text: {
    color: colors.primary[theme.palette.mode],
  },
  outlined: {
    color: colors.primary[theme.palette.mode],
    borderColor: borderColors.primary[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.primary[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.primary[theme.palette.mode].hover,
    },
  },
  contained: {
    color: colors.secondary[theme.palette.mode],
    background: backgroundColors.primary[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.primary[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.primary[theme.palette.mode].hover,
    },
  },
}))(StyledDisabledFontButton);

const SecondaryButton = withStyles((theme: Theme) => ({
  text: {
    color: backgroundColors.secondary[theme.palette.mode].default,
  },
  outlined: {
    color: borderColors.secondary[theme.palette.mode].default,
    borderColor: borderColors.secondary[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.secondary[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.secondary[theme.palette.mode].hover,
    },
  },
  contained: {
    color: colors.secondary[theme.palette.mode],
    background: backgroundColors.secondary[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.secondary[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.secondary[theme.palette.mode].hover,
    },
  },
}))(StyledDisabledFontButton);

const MigrateButton = withStyles((theme: Theme) => ({
  text: {
    color: backgroundColors.migrate[theme.palette.mode].default,
  },
  outlined: {
    color: borderColors.migrate[theme.palette.mode].default,
    borderColor: borderColors.migrate[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.migrate[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.migrate[theme.palette.mode].hover,
    },
  },
  contained: {
    color: colors.migrate[theme.palette.mode],
    background: backgroundColors.migrate[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.migrate[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.migrate[theme.palette.mode].hover,
    },
  },
}))(StyledDisabledFontButton);

const TertiaryButton = withStyles((theme: Theme) => ({
  text: {
    color: colors.tertiary[theme.palette.mode],
  },
  outlined: {
    color: borderColors.tertiary[theme.palette.mode].default,
    borderColor: borderColors.tertiary[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.tertiary[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.tertiary[theme.palette.mode].hover,
    },
  },
  contained: {
    color: colors.tertiary[theme.palette.mode],
    background: backgroundColors.tertiary[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.tertiary[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.tertiary[theme.palette.mode].hover,
    },
  },
}))(StyledDisabledFontButton);

const DefaultButton = withStyles((theme: Theme) => ({
  text: {
    color: colors.default[theme.palette.mode],
  },
  outlined: {
    color: colors.default[theme.palette.mode],
    borderColor: borderColors.default[theme.palette.mode].default,
    background: backgroundColors.default[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.default[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.default[theme.palette.mode].hover,
    },
  },
  contained: {
    color: colors.default[theme.palette.mode],
    background: backgroundColors.default[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.default[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.default[theme.palette.mode].hover,
    },
  },
}))(StyledDisabledFontButton);

const TransparentButton = withStyles((theme: Theme) => ({
  text: {
    color: colors.default[theme.palette.mode],
  },
  outlined: {
    color: colors.default[theme.palette.mode],
    borderColor: borderColors.transparent[theme.palette.mode].default,
    background: backgroundColors.transparent[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.transparent[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.transparent[theme.palette.mode].hover,
    },
    backdropFilter: 'blur(6px)',
  },
  contained: {
    color: colors.default[theme.palette.mode],
    background: backgroundColors.transparent[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.transparent[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.transparent[theme.palette.mode].hover,
    },
    backdropFilter: 'blur(6px)',
  },
}))(StyledDisabledFontButton);

const WhiteButton = withStyles((theme: Theme) => ({
  text: {
    color: colors.white[theme.palette.mode],
  },
  outlined: {
    color: colors.white[theme.palette.mode],
    borderColor: borderColors.white[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.white[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.white[theme.palette.mode].hover,
    },
  },
  contained: {
    color: colors.white[theme.palette.mode],
    background: backgroundColors.white[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.white[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.white[theme.palette.mode].hover,
    },
  },
}))(StyledDisabledFontButton);

const ErrorButton = withStyles((theme: Theme) => ({
  text: {
    color: colors.error[theme.palette.mode],
  },
  outlined: {
    color: colors.error[theme.palette.mode],
    borderColor: borderColors.error[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.error[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.error[theme.palette.mode].hover,
    },
  },
  contained: {
    color: colors.error[theme.palette.mode],
    background: backgroundColors.error[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.error[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.error[theme.palette.mode].hover,
    },
  },
}))(StyledDisabledFontButton);

const WarningButton = withStyles((theme: Theme) => ({
  text: {
    color: colors.warning[theme.palette.mode],
  },
  outlined: {
    color: colors.warning[theme.palette.mode],
    borderColor: borderColors.warning[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.warning[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.warning[theme.palette.mode].hover,
    },
  },
  contained: {
    color: colors.warning[theme.palette.mode],
    background: backgroundColors.warning[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.warning[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.warning[theme.palette.mode].hover,
    },
  },
}))(StyledDisabledFontButton);

const PendingButton = withStyles((theme: Theme) => ({
  text: {
    color: colors.pending[theme.palette.mode],
  },
  outlined: {
    color: colors.pending[theme.palette.mode],
    borderColor: borderColors.pending[theme.palette.mode].default,
    '&:hover': {
      borderColor: borderColors.pending[theme.palette.mode].hover,
    },
    '&:active': {
      borderColor: borderColors.pending[theme.palette.mode].hover,
    },
  },
  contained: {
    color: colors.pending[theme.palette.mode],
    background: backgroundColors.pending[theme.palette.mode].default,
    '&:hover': {
      background: backgroundColors.pending[theme.palette.mode].hover,
    },
    '&:active': {
      background: backgroundColors.pending[theme.palette.mode].hover,
    },
  },
}))(StyledDisabledFontButton);

export const ButtonTypes = {
  primary: PrimaryButton,
  secondary: SecondaryButton,
  default: DefaultButton,
  white: WhiteButton,
  error: ErrorButton,
  warning: WarningButton,
  tertiary: TertiaryButton,
  pending: PendingButton,
  transparent: TransparentButton,
  migrate: MigrateButton,
};

export interface CustomButtonProps extends Omit<ButtonProps, 'color'> {
  color: keyof typeof ButtonTypes;
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, color, ...rest }: CustomButtonProps) => {
  const ButtonToRender = ButtonTypes[color];

  return <ButtonToRender {...rest}>{children}</ButtonToRender>;
};

export default CustomButton;
