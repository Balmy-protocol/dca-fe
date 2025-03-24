import React from 'react';
import { Button, ContainerBox, FormControl, IconButton, Typography, InputContainer } from '..';
import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components';
import Input from '@mui/material/Input';
import { ToggleArrowIcon } from '../../icons';
import { colors } from '../../theme';
import { buildTypographyVariant } from '../../theme/typography';
import { AmountsOfToken, Token } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import { formatCurrencyAmount } from '../../common/utils/currency';
import { withStyles } from 'tss-react/mui';
import useTokenAmountUsd, {
  amountValidator,
  calculateTokenAmount,
  calculateUsdAmount,
  getInputColor,
  getSubInputColor,
  InputTypeT,
} from './useTokenAmountUsd';

const StyledButton = styled(Button)`
  min-width: 0;
  padding: 0 !important;
`;

const StyledInput = styled(Input)`
  padding: 0 !important;
  background-color: transparent !important;
`;

interface TokenAmounUsdInputProps {
  token?: Nullable<Token>;
  balance?: AmountsOfToken;
  tokenPrice?: bigint;
  value?: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  onMaxCallback?: () => void;
}

interface InputProps extends TokenAmounUsdInputProps {
  onFocus: () => void;
  onBlur: () => void;
}

const StyledIconButton = withStyles(IconButton, ({ palette }) => ({
  root: {
    border: `1px solid ${colors[palette.mode].border.border1}`,
  },
  disabled: {
    color: `${colors[palette.mode].accent.accent600} !important`,
  },
}));

const TokenInput = ({ onChange, value, token, tokenPrice, onBlur, onFocus, disabled }: InputProps) => {
  const {
    palette: { mode },
  } = useTheme();
  const usdAmount = calculateUsdAmount({ value, token, tokenPrice });

  return (
    <ContainerBox flexDirection="column" flex={1}>
      <FormControl variant="standard" fullWidth>
        <StyledInput
          id="component-simple"
          onChange={(evt) =>
            amountValidator({
              onChange,
              nextValue: evt.target.value,
              decimals: token?.decimals || 18,
            })
          }
          value={value || ''}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
          placeholder="0.0"
          disableUnderline
          disabled={disabled}
          inputProps={{
            style: {
              color: getInputColor({ disabled, mode, hasValue: !isUndefined(value) }),
              padding: 0,
              textOverflow: 'ellipsis',
            },
          }}
          sx={{ ...buildTypographyVariant(mode).h4Bold, color: 'inherit' }}
        />
      </FormControl>
      <Typography variant="bodySmallRegular" color={getSubInputColor({ mode, hasValue: !isUndefined(value) })}>
        {`$${usdAmount}`}
      </Typography>
    </ContainerBox>
  );
};

const UsdInput = ({ onChange, value, token, tokenPrice, onBlur, onFocus, disabled }: InputProps) => {
  const {
    palette: { mode },
  } = useTheme();
  const tokenAmount = calculateTokenAmount({ value, tokenPrice });

  return (
    <ContainerBox flexDirection="column" flex={1}>
      <FormControl variant="standard">
        <StyledInput
          id="component-simple"
          onChange={(evt) =>
            amountValidator({
              onChange,
              nextValue: evt.target.value,
              decimals: 2,
            })
          }
          value={value || ''}
          onFocus={onFocus}
          onBlur={onBlur}
          startAdornment="$"
          autoComplete="off"
          placeholder="0.00"
          disableUnderline
          disabled={disabled}
          inputProps={{
            style: {
              color: getInputColor({ disabled, mode, hasValue: !isUndefined(value) }),
              padding: 0,
              textOverflow: 'ellipsis',
            },
          }}
          sx={{
            ...buildTypographyVariant(mode).h4Bold,
            gap: 0,
            color: getInputColor({ disabled, mode, hasValue: !isUndefined(value) }),
          }}
        />
      </FormControl>
      <Typography variant="bodySmallRegular" color={getSubInputColor({ mode, hasValue: !isUndefined(value) })}>
        ≈{` ${tokenAmount} ${token?.symbol}`}
      </Typography>
    </ContainerBox>
  );
};

const StyledHeader = styled(ContainerBox).attrs(() => ({ gap: 3, justifyContent: 'center', alignItems: 'center' }))``;

const StyledFooter = styled(ContainerBox).attrs(() => ({ gap: 3, justifyContent: 'center', alignItems: 'center' }))``;

const StyledEndContent = styled(ContainerBox).attrs(() => ({
  gap: 3,
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  flexDirection: 'column',
}))`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(2)} ${spacing(3)};
    padding-left: 0px;
  `}
`;

const InputContentContainer = styled(ContainerBox).attrs({ gap: 3 })`
  ${({ theme }) => `
    position: relative;
    flex: 1;
    padding: ${theme.spacing(3)};
    gap: ${theme.spacing(3)};
  `}
`;

const TokenAmounUsdInput = ({
  token,
  balance,
  tokenPrice,
  value,
  onChange,
  disabled,
  onMaxCallback,
}: TokenAmounUsdInputProps) => {
  const {
    isFocused,
    setIsFocused,
    mode,
    inputType,
    internalValue,
    onChangeType,
    onValueChange,
    onMaxValueClick,
    intl,
  } = useTokenAmountUsd({ value, token, tokenPrice, onChange, onMaxCallback, balance });

  return (
    <InputContainer isFocused={isFocused} alignItems="center" disabled={disabled} padding="0 !important">
      <InputContentContainer>
        <StyledIconButton color="primary" disabled={isUndefined(tokenPrice) || disabled} onClick={onChangeType}>
          <ToggleArrowIcon sx={{ color: colors[mode].accent.primary }} />
        </StyledIconButton>
        <ContainerBox alignItems="center" gap={2} flex={1}>
          {inputType === InputTypeT.token ? (
            <TokenInput
              token={token}
              balance={balance}
              tokenPrice={tokenPrice}
              value={internalValue}
              onChange={onValueChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
            />
          ) : (
            <UsdInput
              token={token}
              balance={balance}
              tokenPrice={tokenPrice}
              value={internalValue}
              onChange={onValueChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
            />
          )}
        </ContainerBox>
      </InputContentContainer>
      <StyledEndContent>
        <StyledHeader>
          <Typography
            variant="bodySemibold"
            color={getInputColor({ disabled, mode, hasValue: !isUndefined(internalValue) })}
          >
            {inputType === InputTypeT.token ? token?.symbol : 'USD'}
          </Typography>
        </StyledHeader>
        {balance && (
          <StyledFooter>
            <Typography
              variant="labelRegular"
              color={disabled ? colors[mode].typography.typo5 : colors[mode].typography.typo3}
            >
              <FormattedMessage defaultMessage="Balance:" description="balance" />
              {` `}
              {formatCurrencyAmount({ amount: balance.amount, token: token || undefined, intl })}
            </Typography>
            <StyledButton size="small" variant="text" onClick={onMaxValueClick} disabled={disabled}>
              <FormattedMessage defaultMessage="Max" description="max" />
            </StyledButton>
          </StyledFooter>
        )}
      </StyledEndContent>
    </InputContainer>
  );
};

export { TokenAmounUsdInput, TokenAmounUsdInputProps };
