import styled, { ThemeProps, DefaultTheme } from 'styled-components';
import { ContainerBox } from '../container-box';
import { colors } from '../..';

const focusedStyles = ({ palette: { mode } }: ThemeProps<DefaultTheme>['theme']) => `
  background: ${colors[mode].background.tertiary};
  border: 1px solid ${colors[mode].accentPrimary};
`;

const emptyStyles = ({ palette: { mode } }: ThemeProps<DefaultTheme>['theme']) => `
  background: ${colors[mode].background.secondary};
  border: 1px solid ${colors[mode].border.border1};
`;

const disabledStyles = ({ palette: { mode } }: ThemeProps<DefaultTheme>['theme']) => `
  background: ${colors[mode].background.secondary};
  border: 1px solid ${colors[mode].accentPrimary};
  opacity: 0.5;
  cursor: not-allowed;
`;

const unfocusedWithValueStyles = ({ palette: { mode } }: ThemeProps<DefaultTheme>['theme']) => `
  background: ${colors[mode].background.secondary};
  border: 1px solid ${colors[mode].border.border1};
`;

export const InputContainer = styled(ContainerBox)<{ isFocused: boolean; disabled?: boolean; hasValue?: boolean }>`
  ${({ theme, isFocused, disabled, hasValue, gap }) => `
    padding: ${theme.spacing(2)} ${theme.spacing(3)};
    gap: ${theme.spacing(gap || 3)};
    border-radius: ${theme.spacing(2)};
    position: relative;
    ${hasValue ? emptyStyles(theme) : unfocusedWithValueStyles(theme)}
    ${isFocused && focusedStyles(theme)}
    ${disabled && disabledStyles(theme)}
  `}
`;
