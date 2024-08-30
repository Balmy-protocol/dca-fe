import React, { useEffect, useState } from 'react';
import { Button, ContainerBox, FormControl, IconButton, Typography, DividerBorder2, InputContainer } from '..';
import isUndefined from 'lodash/isUndefined';
import styled, { DefaultTheme, ThemeProps } from 'styled-components';
import Input from '@mui/material/Input';
import { ToggleArrowIcon } from '../../icons';
import { colors } from '../../theme';
import { buildTypographyVariant } from '../../theme/typography';
import { AmountsOfToken, Token } from 'common-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatUnits, parseUnits } from 'viem';
import { useTheme } from '@mui/material';
import { formatCurrencyAmount } from '../../common/utils/currency';
import { withStyles } from 'tss-react/mui';

const getInputColor = ({
  disabled,
  hasValue,
  mode,
}: {
  disabled?: boolean;
  hasValue?: boolean;
  mode: ThemeProps<DefaultTheme>['theme']['palette']['mode'];
}) => {
  if (disabled) {
    return colors[mode].typography.typo2;
  } else if (hasValue) {
    return colors[mode].typography.typo1;
  } else {
    return colors[mode].typography.typo5;
  }
};

const getSubInputColor = ({
  hasValue,
  mode,
}: {
  hasValue?: boolean;
  mode: ThemeProps<DefaultTheme>['theme']['palette']['mode'];
}) => {
  if (hasValue) {
    return colors[mode].typography.typo3;
  } else {
    return colors[mode].typography.typo5;
  }
};

const StyledButton = styled(Button)`
  min-width: 0;
`;

interface TokenAmounUsdInputProps {
  token?: Nullable<Token>;
  balance?: AmountsOfToken;
  tokenPrice?: bigint;
  value?: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
}

interface InputProps extends TokenAmounUsdInputProps {
  onFocus: () => void;
  onBlur: () => void;
}

const StyledIconButton = withStyles(IconButton, ({ palette }) => ({
  disabled: {
    color: `${colors[palette.mode].accent.accent600} !important`,
  },
}));

const calculateUsdAmount = ({
  value,
  token,
  tokenPrice,
}: {
  value?: string;
  token?: Nullable<Token>;
  tokenPrice?: bigint;
}) =>
  isUndefined(value) || value === '' || isUndefined(tokenPrice) || !token
    ? '0'
    : parseFloat(formatUnits(parseUnits(value, token.decimals) * tokenPrice, token.decimals + 18)).toFixed(2);

const calculateTokenAmount = ({ value, tokenPrice }: { value?: string; tokenPrice?: bigint }) =>
  isUndefined(value) || value === '' || isUndefined(tokenPrice)
    ? '0'
    : formatUnits(parseUnits(value, 18 * 2) / tokenPrice, 18).toString();

const validator = ({
  nextValue,
  decimals,
  onChange,
}: {
  nextValue: string;
  onChange: (newValue: string) => void;
  decimals: number;
}) => {
  const newNextValue = nextValue.replace(/,/g, '.');
  // sanitize value
  const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d{0,${decimals}}$`);

  if (inputRegex.test(newNextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
    onChange(newNextValue.startsWith('.') ? `0${newNextValue}` : newNextValue || '');
  }
};

const TokenInput = ({ onChange, value, token, tokenPrice, onBlur, onFocus, disabled }: InputProps) => {
  const {
    palette: { mode },
  } = useTheme();
  const usdAmount = calculateUsdAmount({ value, token, tokenPrice });

  return (
    <ContainerBox flexDirection="column" flex={1}>
      <FormControl variant="standard" fullWidth>
        <Input
          id="component-simple"
          onChange={(evt) =>
            validator({
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
          inputProps={{ style: { color: getInputColor({ disabled, mode, hasValue: !isUndefined(value) }) } }}
          sx={{ ...buildTypographyVariant(mode).h6, fontWeight: '700', color: 'inherit' }}
        />
      </FormControl>
      <Typography variant="bodySmallRegular" color={getSubInputColor({ mode, hasValue: !isUndefined(value) })}>
        ≈{` $${usdAmount}`}
      </Typography>
    </ContainerBox>
  );
};

// TODO
const UsdInput = ({ onChange, value, token, tokenPrice, onBlur, onFocus, disabled }: InputProps) => {
  const {
    palette: { mode },
  } = useTheme();
  const tokenAmount = calculateTokenAmount({ value, tokenPrice });

  return (
    <ContainerBox flexDirection="column" flex={1}>
      <FormControl variant="standard">
        <Input
          id="component-simple"
          onChange={(evt) =>
            validator({
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
          inputProps={{ style: { color: getInputColor({ disabled, mode, hasValue: !isUndefined(value) }) } }}
          sx={{ ...buildTypographyVariant(mode).h6, fontWeight: '700' }}
        />
      </FormControl>
      <Typography variant="bodySmallRegular" color={getSubInputColor({ mode, hasValue: !isUndefined(value) })}>
        ≈{` ${tokenAmount} ${token?.symbol}`}
      </Typography>
    </ContainerBox>
  );
};

enum InputTypeT {
  usd = 'usd',
  token = 'token',
}

const TokenAmounUsdInput = ({ token, balance, tokenPrice, value, onChange, disabled }: TokenAmounUsdInputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const {
    palette: { mode },
  } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [inputType, setInputType] = useState<InputTypeT>(InputTypeT.token);
  const intl = useIntl();

  useEffect(() => {
    // We basically check if by some reason or other, the value of the parent component has changed to something that we did not send
    // But we only need to check for when the inputType is the token direct amount.
    if (inputType === InputTypeT.token) {
      if (value !== internalValue) {
        setInternalValue(value);
      }
    } else if (inputType === InputTypeT.usd && !isUndefined(tokenPrice) && token) {
      if (isUndefined(value)) {
        setInternalValue(undefined);
        return;
      }

      const newInternalValue = calculateUsdAmount({ value, token, tokenPrice });

      if (!internalValue || newInternalValue !== parseFloat(internalValue).toFixed(2)) {
        setInternalValue(newInternalValue);
      }
    } else {
      throw new Error('invalid inputType');
    }
  }, [value]);

  const onChangeType = () => {
    let newInternalValue: string | undefined;

    if (isUndefined(tokenPrice)) {
      return;
    }

    if (!isUndefined(value)) {
      if (inputType === InputTypeT.token && token) {
        newInternalValue = calculateUsdAmount({ value, token, tokenPrice });
      } else if (inputType === InputTypeT.usd) {
        newInternalValue = calculateTokenAmount({ value: internalValue || '0', tokenPrice });
      } else {
        throw new Error('invalid inputType');
      }
    }

    setInputType((oldInputType) => (oldInputType === InputTypeT.token ? InputTypeT.usd : InputTypeT.token));
    setInternalValue(newInternalValue);
  };

  const onValueChange = (newValue: string) => {
    if (inputType === InputTypeT.token) {
      onChange(newValue);
    } else if (inputType === InputTypeT.usd) {
      if (isUndefined(tokenPrice)) {
        // Should never happen since we disable the button to change the inputType when there is no token price, never hurts to take into account
        throw new Error('Token price is undefined for inputType usd');
      }

      setInternalValue(newValue);

      onChange(
        calculateTokenAmount({
          value: newValue,
          tokenPrice,
        })
      );
    } else {
      throw new Error('invalid inputType');
    }
  };

  const onMaxValueClick = () => {
    if (!balance) {
      throw new Error('should not call on max value without a balance');
    }
    onChange(formatUnits(BigInt(balance.amount), token?.decimals || 18));
  };
  return (
    <InputContainer isFocused={isFocused} alignItems="center" disabled={disabled}>
      <StyledIconButton color="primary" disabled={isUndefined(tokenPrice)} onClick={onChangeType}>
        <ToggleArrowIcon />
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
        <ContainerBox flexDirection="column">
          <Typography variant="h6" color={getInputColor({ disabled, mode, hasValue: !isUndefined(internalValue) })}>
            {inputType === InputTypeT.token ? token?.symbol : 'USD'}
          </Typography>
          {balance && (
            <Typography variant="bodySmallRegular" color={colors[mode].typography.typo3}>
              <FormattedMessage defaultMessage="Balance:" description="balance" />
              {` `}
              {formatCurrencyAmount({ amount: balance.amount, token: token || undefined, intl })}
            </Typography>
          )}
        </ContainerBox>
        {balance && (
          <>
            <ContainerBox alignSelf="stretch">
              <DividerBorder2 orientation="vertical" />
            </ContainerBox>
            <ContainerBox>
              <StyledButton size="small" variant="text" onClick={onMaxValueClick}>
                <FormattedMessage defaultMessage="Max" description="max" />
              </StyledButton>
            </ContainerBox>
          </>
        )}
      </ContainerBox>
    </InputContainer>
  );
};

export { TokenAmounUsdInput, TokenAmounUsdInputProps };
