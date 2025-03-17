import { useEffect, useMemo, useState } from 'react';

import { Chains } from '@balmy/sdk';
import { Address, formatUnits, parseUnits } from 'viem';
import { AmountsOfToken, Token } from 'common-types';
import { ThemeProps, DefaultTheme, useTheme } from 'styled-components';
import { useIntl } from 'react-intl';
import isUndefined from 'lodash/isUndefined';
import { colors } from '../../theme';

// TODO: BLY-3260 Move to common packagez
export const MIN_AMOUNT_FOR_MAX_DEDUCTION = {
  [Chains.POLYGON.chainId]: parseUnits('0.1', 18),
  [Chains.BNB_CHAIN.chainId]: parseUnits('0.1', 18),
  [Chains.ARBITRUM.chainId]: parseUnits('0.001', 18),
  [Chains.OPTIMISM.chainId]: parseUnits('0.001', 18),
  [Chains.ETHEREUM.chainId]: parseUnits('0.1', 18),
  [Chains.BASE_GOERLI.chainId]: parseUnits('0.1', 18),
  [Chains.GNOSIS.chainId]: parseUnits('0.1', 18),
  [Chains.MOONBEAM.chainId]: parseUnits('0.1', 18),
};

export const MAX_DEDUCTION = {
  [Chains.POLYGON.chainId]: parseUnits('0.045', 18),
  [Chains.BNB_CHAIN.chainId]: parseUnits('0.045', 18),
  [Chains.ARBITRUM.chainId]: parseUnits('0.00015', 18),
  [Chains.OPTIMISM.chainId]: parseUnits('0.000525', 18),
  [Chains.ETHEREUM.chainId]: parseUnits('0.021', 18),
  [Chains.BASE_GOERLI.chainId]: parseUnits('0.021', 18),
  [Chains.GNOSIS.chainId]: parseUnits('0.1', 18),
  [Chains.MOONBEAM.chainId]: parseUnits('0.1', 18),
};

export const getMinAmountForMaxDeduction = (chainId: number) =>
  MIN_AMOUNT_FOR_MAX_DEDUCTION[chainId] || parseUnits('0.1', 18);
export const getMaxDeduction = (chainId: number) => MAX_DEDUCTION[chainId] || parseUnits('0.045', 18);
export const PROTOCOL_TOKEN_ADDRESS: Address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const calculateUsdAmount = ({
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

export const calculateTokenAmount = ({ value, tokenPrice }: { value?: string; tokenPrice?: bigint }) =>
  isUndefined(value) || value === '' || isUndefined(tokenPrice)
    ? '0'
    : formatUnits(parseUnits(value, 18 * 2) / tokenPrice, 18).toString();

export const amountValidator = ({
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

export const getInputColor = ({
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

export const getSubInputColor = ({
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

export enum InputTypeT {
  usd = 'usd',
  token = 'token',
}

interface UseTokenAmountUsdProps {
  value?: string;
  token?: Nullable<Token>;
  tokenPrice?: bigint;
  onChange: (newValue: string) => void;
  onMaxCallback?: () => void;
  balance?: AmountsOfToken;
}

const useTokenAmountUsd = ({ value, token, tokenPrice, onChange, onMaxCallback, balance }: UseTokenAmountUsdProps) => {
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
    } else if (inputType === InputTypeT.usd) {
      if (isUndefined(value) || isUndefined(tokenPrice) || !token) {
        setInternalValue(undefined);
        return;
      }

      const newInternalValue = calculateUsdAmount({ value, token, tokenPrice });
      if (isUndefined(internalValue) || newInternalValue !== parseFloat(internalValue || '0').toFixed(2)) {
        setInternalValue(newInternalValue);
      }
    } else {
      throw new Error('invalid inputType');
    }
  }, [value]);

  useEffect(() => {
    if (!token) {
      setInputType(InputTypeT.token);
    }
  }, [token]);

  const onChangeType = () => {
    let newInternalValue: string | undefined;

    if (isUndefined(tokenPrice) || !token) {
      return;
    }

    if (!isUndefined(value)) {
      if (inputType === InputTypeT.token) {
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

    if (onMaxCallback) {
      // onChange will be called by the parent component
      onMaxCallback();
      return;
    }

    if (balance && token && token.address === PROTOCOL_TOKEN_ADDRESS) {
      const maxValue =
        BigInt(balance.amount) >= getMinAmountForMaxDeduction(token.chainId)
          ? BigInt(balance.amount) - getMaxDeduction(token.chainId)
          : BigInt(balance.amount);
      onChange(formatUnits(maxValue, token.decimals));
    } else {
      onChange(formatUnits(BigInt(balance.amount), token?.decimals || 18));
    }
  };

  return useMemo(
    () => ({
      intl,
      isFocused,
      setIsFocused,
      mode,
      inputType,
      internalValue,
      onChangeType,
      onValueChange,
      onMaxValueClick,
    }),
    [intl, isFocused, setIsFocused, mode, inputType, internalValue, onChangeType, onValueChange, onMaxValueClick]
  );
};

export default useTokenAmountUsd;
