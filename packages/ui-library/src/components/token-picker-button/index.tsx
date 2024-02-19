import React from 'react';
import styled from 'styled-components';
import { colors, baseColors } from '../../theme';
import { TokenWithIcon } from 'common-types';
import { ButtonProps, Skeleton, Typography } from '@mui/material';
import { SPACING } from '../../theme/constants';
import { FormattedMessage } from 'react-intl';
import { Button } from '../button';
import { KeyboardArrowDownIcon } from '../../icons';

const StyledTokenPickerButton = styled(Button)`
  ${({ theme: { spacing, palette } }) => `
  display: flex;
  align-items: center;
  gap: ${spacing(2)};
  padding: ${spacing(2)};
  border: 1px solid ${colors[palette.mode].border.border1};
  border-radius: ${spacing(15)};
  transition: box-shadow 300ms;
  box-shadow: ${baseColors.dropShadow.dropShadow100};
  :disabled {
    box-shadow: none;
  }
`}
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
  token: TokenWithIcon;
  isSelected: boolean;
  isLoading?: boolean;
  onClick: ButtonProps['onClick'];
  showAction: boolean;
  defaultText?: string;
  disabled?: boolean;
}

const TokenPickerButton = ({
  token,
  isSelected,
  isLoading,
  onClick,
  showAction = true,
  defaultText,
  disabled,
}: TokenPickerButtonProps) => (
  <StyledTokenPickerButton disabled={disabled} onClick={onClick}>
    {token.icon}
    <StyledActiveLabel $isSelected={isSelected}>
      {isLoading ? (
        <Skeleton variant="text" animation="wave" width={SPACING(25)} />
      ) : isSelected ? (
        token.symbol
      ) : (
        defaultText || <FormattedMessage description="select" defaultMessage="Select" />
      )}
    </StyledActiveLabel>
    {showAction && <StyledKeyboardArrowDownIcon fontSize="small" />}
  </StyledTokenPickerButton>
);

export { TokenPickerButton, TokenPickerButtonProps };
