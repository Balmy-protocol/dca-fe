import styled, { useTheme } from 'styled-components';
import React, { useCallback, useRef } from 'react';
import isUndefined from 'lodash/isUndefined';
import { FormattedMessage } from 'react-intl';

import { buildTypographyVariant } from 'ui-library/src/theme/typography';
import useTokenAmountUsd, {
  calculateTokenAmount,
  calculateUsdAmount,
  getInputColor,
  getSubInputColor,
  handleAmountValidator,
  InputTypeT,
} from '../token-amount-usd-input/useTokenAmountUsd';
import { Token, AmountsOfToken, TokenWithIcon } from 'common-types';
import { formatCurrencyAmount, formatUsdAmount } from '../../common/utils/currency';
import { colors } from '../../theme';
import { Button, FormControl, FormHelperText, IconButton, Input, Skeleton, Typography } from '@mui/material';
import { ContainerBox } from '../container-box';
import { TokenPickerButton } from '../token-picker-button';
import { EmptyWalletIcon, ToggleArrowIcon } from '../../icons';
import { InputContainer } from '../input-container';

const StyledInput = styled(Input)`
  padding: 0 !important;
  background-color: transparent !important;
`;

interface InputProps {
  id: string;
  token?: Nullable<Token>;
  tokenPrice?: bigint;
  value?: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  onFocus: () => void;
  onBlur: () => void;
  priceImpactLabel?: React.ReactNode;
  onChangeType: () => void;
}

const TokenInput = ({
  id,
  onChange,
  value,
  token,
  tokenPrice,
  onBlur,
  onFocus,
  disabled,
  priceImpactLabel,
  onChangeType,
}: InputProps) => {
  const {
    palette: { mode },
  } = useTheme();
  const usdAmount = calculateUsdAmount({ value, token, tokenPrice });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      handleAmountValidator({
        onChange,
        nextValue: evt.target.value,
        decimals: token?.decimals || 18,
        currentValue: value,
        inputRef,
      });
    },
    [onChange, value, inputRef, token?.decimals]
  );

  return (
    <ContainerBox flexDirection="column" flex={1} alignItems="flex-end">
      <FormControl variant="standard" fullWidth>
        <StyledInput
          id={`${id}-token`}
          onChange={handleChange}
          inputRef={inputRef}
          value={value || ''}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
          placeholder="0.0"
          disableUnderline
          disabled={disabled}
          inputProps={{
            style: {
              ...buildTypographyVariant(mode).h2Bold,
              color: getInputColor({ mode, hasValue: value !== '' && !isUndefined(value) }),
              padding: 0,
              textOverflow: 'ellipsis',
              textAlign: 'right',
              height: 'auto',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            },
          }}
        />
      </FormControl>
      <ContainerBox alignItems="center" gap={1}>
        <Typography
          variant="bodySemibold"
          color={getSubInputColor({ mode, hasValue: value !== '' && !isUndefined(value) })}
        >
          {`$${usdAmount}`}
        </Typography>
        {priceImpactLabel}
        <IconButton sx={{ padding: 0 }} disabled={isUndefined(tokenPrice) || disabled} onClick={onChangeType}>
          <ToggleArrowIcon fontSize="small" sx={{ color: colors[mode].accent.primary }} />
        </IconButton>
      </ContainerBox>
    </ContainerBox>
  );
};

/*
  This is a custom input component that allows the user to input a USD amount.
  The $ symbol is not part of the input value, but it is displayed to the user.
  We need to handle the $ symbol manually to ensure the cursor is positioned correctly, for events like focus, click, and drag
*/
const UsdInput = ({
  id,
  onChange,
  value,
  token,
  tokenPrice,
  onBlur,
  onFocus,
  disabled,
  priceImpactLabel,
  onChangeType,
}: InputProps) => {
  const {
    palette: { mode },
  } = useTheme();
  const tokenAmount = calculateTokenAmount({ value, tokenPrice });
  const inputColor = getInputColor({ mode, hasValue: value !== '' && !isUndefined(value) });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      // Remove $ character
      const numericValue = evt.target.value.replace(/[$,]/g, '');

      handleAmountValidator({
        onChange,
        nextValue: numericValue,
        decimals: 2,
        currentValue: value,
        inputRef,
      });
    },
    [onChange, value, inputRef]
  );

  const handleKeyDown = useCallback(
    (evt: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent cursor from moving before the $ sign
      if (evt.key === 'ArrowLeft' || evt.key === 'Backspace') {
        if (inputRef.current) {
          const cursorPos = inputRef.current.selectionStart;
          if (cursorPos === 1) {
            evt.preventDefault();
          }
        }
      }

      // Handle Home key to place cursor after $ sign
      if (evt.key === 'Home') {
        evt.preventDefault();
        if (inputRef.current) {
          inputRef.current.setSelectionRange(1, 1);
        }
      }
    },
    [inputRef]
  );

  const handleClick = useCallback(() => {
    if (inputRef.current && inputRef.current.selectionStart === 0) {
      // Move cursor to position 1 (after the $)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(1, 1);
        }
      }, 0);
    }
  }, [inputRef]);

  const handleSelect = useCallback(() => {
    if (inputRef.current) {
      const { selectionStart, selectionEnd } = inputRef.current;

      // If selection starts at position 0, adjust it to start after the $ symbol
      if (selectionStart === 0) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(1, selectionEnd || 1);
          }
        }, 0);
      }
    }
  }, [inputRef]);

  const handleFocus = useCallback(() => {
    onFocus();
    setTimeout(() => {
      if (inputRef.current && inputRef.current.selectionStart === 0) {
        inputRef.current.setSelectionRange(1, 1);
      }
    }, 0);
  }, [onFocus, inputRef]);

  return (
    <ContainerBox flexDirection="column" flex={1} alignItems="flex-end">
      <FormControl variant="standard" fullWidth>
        <StyledInput
          id={`${id}-usd`}
          onChange={handleChange}
          value={value ? `$${value}` : ''}
          onFocus={handleFocus}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          onSelect={handleSelect}
          onBlur={onBlur}
          autoComplete="off"
          placeholder="$0.00"
          disableUnderline
          disabled={disabled}
          inputProps={{
            style: {
              ...buildTypographyVariant(mode).h2Bold,
              color: inputColor,
              padding: 0,
              textOverflow: 'ellipsis',
              textAlign: 'right',
              height: 'auto',
            },
          }}
        />
      </FormControl>
      <ContainerBox alignItems="center" gap={1}>
        <Typography
          variant="bodySemibold"
          color={getSubInputColor({ mode, hasValue: value !== '' && !isUndefined(value) })}
        >
          ≈{` ${tokenAmount} ${token?.symbol}`}
        </Typography>
        {priceImpactLabel}
        <IconButton sx={{ padding: 0 }} disabled={isUndefined(tokenPrice) || disabled} onClick={onChangeType}>
          <ToggleArrowIcon fontSize="small" sx={{ color: colors[mode].accent.primary }} />
        </IconButton>
      </ContainerBox>
    </ContainerBox>
  );
};

const StyledInputContainer = styled(InputContainer)`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
    disabled,
  }) => `
    padding: ${spacing(6)};
    border: 1px solid ${colors[mode].border.border1};
    ${
      disabled &&
      `
      opacity: 0.8;
      pointer-events: none;
    `
    }
  `}
`;

const StyledMaxButtonContainer = styled(ContainerBox)`
  position: absolute;

  ${({ theme: { spacing } }) => `
    right: ${spacing(3)};
    top: ${spacing(1)};
  `}
`;

type TokenPickerAmountUsdInputProps = {
  id: string;
  label: React.ReactNode;
  cantFund?: boolean;
  balance?: AmountsOfToken;
  value: string;
  disabled?: boolean;
  isLoadingBalance?: boolean;
  token?: TokenWithIcon;
  startSelectingCoin: (newToken?: Token) => void;
  onChange: (newAmount: string) => void;
  maxBalanceBtn?: boolean;
  priceImpact?: string;
  tokenPrice?: bigint;
};

const TokenPickerAmountUsdInput = ({
  id,
  label,
  cantFund,
  balance,
  value,
  disabled,
  isLoadingBalance,
  token,
  onChange,
  startSelectingCoin,
  maxBalanceBtn,
  priceImpact,
  tokenPrice,
}: TokenPickerAmountUsdInputProps) => {
  const {
    intl,
    mode,
    isFocused,
    setIsFocused,
    onMaxValueClick,
    inputType,
    internalValue,
    onChangeType,
    onValueChange,
  } = useTokenAmountUsd({
    value,
    token,
    tokenPrice,
    onChange,
    balance,
  });

  const priceImpactLabel = priceImpact &&
    !isNaN(Number(priceImpact)) &&
    isFinite(Number(priceImpact)) &&
    value !== '...' && (
      <Typography
        variant="bodyRegular"
        color={
          Number(priceImpact) < -2.5
            ? colors[mode].semantic.error.darker
            : Number(priceImpact) > 0
              ? colors[mode].semantic.success.darker
              : 'inherit'
        }
      >
        {` `}({Number(priceImpact) > 0 ? '+' : ''}
        {priceImpact}%)
      </Typography>
    );

  return (
    <StyledInputContainer disabled={disabled} isFocused={isFocused} flexDirection="column" gap={2}>
      <ContainerBox alignItems="center">
        <ContainerBox flexDirection="column" gap={2} alignItems="flex-start" justifyContent="center">
          <Typography variant="labelSemiBold" color={colors[mode].typography.typo3}>
            {label}
          </Typography>
          <TokenPickerButton token={token} showAction onClick={() => startSelectingCoin(token)} />
          {!isUndefined(balance) && token && (
            <ContainerBox alignItems="center" gap={1}>
              <Typography variant="bodySmallRegular" color={colors[mode].typography.typo3}>
                <EmptyWalletIcon />
              </Typography>
              <Typography variant="labelRegular" color={colors[mode].typography.typo3}>
                {isLoadingBalance ? (
                  <Skeleton variant="text" sx={{ minWidth: '10ch' }} />
                ) : (
                  <>
                    {formatCurrencyAmount({ amount: balance.amount, token, intl })}
                    {balance.amountInUSD && ` ($${formatUsdAmount({ amount: balance.amountInUSD, intl })})`}
                  </>
                )}
              </Typography>
            </ContainerBox>
          )}
        </ContainerBox>
        <ContainerBox flexDirection="column" flex="1" alignItems="flex-end" justifyContent="center">
          <ContainerBox alignItems="center" gap={2} flex={1} justifyContent="flex-end">
            {inputType === InputTypeT.token ? (
              <TokenInput
                id={id}
                token={token}
                tokenPrice={tokenPrice}
                value={internalValue}
                onChange={onValueChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled}
                priceImpactLabel={priceImpactLabel}
                onChangeType={onChangeType}
              />
            ) : (
              <UsdInput
                id={id}
                token={token}
                tokenPrice={tokenPrice}
                value={internalValue}
                onChange={onValueChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled}
                priceImpactLabel={priceImpactLabel}
                onChangeType={onChangeType}
              />
            )}
          </ContainerBox>
        </ContainerBox>
        {maxBalanceBtn && !isUndefined(balance) && token && (
          <StyledMaxButtonContainer>
            <Button
              onClick={onMaxValueClick}
              disabled={disabled}
              variant="text"
              size="small"
              sx={{ padding: 0, fontWeight: 500 }}
            >
              <FormattedMessage description="maxWallet" defaultMessage="Max" />
            </Button>
          </StyledMaxButtonContainer>
        )}
      </ContainerBox>
      {!!cantFund && (
        <FormHelperText error id="component-error-text">
          <FormattedMessage description="cantFund" defaultMessage="Amount cannot exceed balance" />
        </FormHelperText>
      )}
    </StyledInputContainer>
  );
};

export { TokenPickerAmountUsdInput, TokenPickerAmountUsdInputProps };
