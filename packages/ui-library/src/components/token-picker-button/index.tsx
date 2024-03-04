import React from 'react';
import styled from 'styled-components';
import { colors, baseColors } from '../../theme';
import { TokenWithIcon } from 'common-types';
import { ButtonProps, Skeleton, Typography } from '@mui/material';
import { SPACING } from '../../theme/constants';
import { FormattedMessage } from 'react-intl';
import { Button } from '../button';
import { KeyboardArrowDownIcon } from '../../icons';

const StyledTokenPickerButton = styled(Button).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
  display: flex;
  align-items: center;
  gap: ${spacing(2)};
  padding: ${spacing(2)};
  border-radius: ${spacing(15)};
  transition: box-shadow 300ms;
  box-shadow: ${baseColors.dropShadow.dropShadow100};
  :disabled {
    box-shadow: none;
  }
`}
`;

const StyledEmptyTokenIcon = styled.div<{ $realSize: string }>`
  ${({
    $realSize,
    theme: {
      palette: { mode },
    },
  }) => `
  width: ${$realSize};
  height: ${$realSize};
  background-color: ${mode === 'light' ? colors[mode].background.primary : colors[mode].background.secondary};
  border-radius: 50%;
  `};
`;

const StyledActiveLabel = styled(Typography).attrs({ variant: 'body', fontWeight: 600, noWrap: true })<{
  $isSelected?: boolean;
}>`
  ${({ theme: { palette }, $isSelected }) => !$isSelected && `color: ${colors[palette.mode].typography.typo4};`}
`;

const StyledKeyboardArrowDownIcon = styled(KeyboardArrowDownIcon)`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2}
  `};
`;

interface TokenPickerButtonProps {
  token?: TokenWithIcon;
  isLoading?: boolean;
  onClick?: ButtonProps['onClick'];
  showAction: boolean;
  defaultText?: string;
  disabled?: boolean;
}

const TokenPickerButton = ({
  token,
  isLoading,
  onClick,
  showAction = true,
  defaultText,
  disabled,
}: TokenPickerButtonProps) => (
  <StyledTokenPickerButton disabled={disabled} onClick={onClick}>
    {token?.icon || <StyledEmptyTokenIcon $realSize={SPACING(7)} />}
    <StyledActiveLabel $isSelected={!!token}>
      {isLoading ? (
        <Skeleton variant="text" animation="wave" width={SPACING(25)} />
      ) : token ? (
        token.symbol
      ) : (
        defaultText || <FormattedMessage description="select" defaultMessage="Select" />
      )}
    </StyledActiveLabel>
    {showAction && <StyledKeyboardArrowDownIcon fontSize="small" />}
  </StyledTokenPickerButton>
);

export { TokenPickerButton, TokenPickerButtonProps };
