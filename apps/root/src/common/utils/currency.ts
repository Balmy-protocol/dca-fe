/* eslint-disable */
import { formatUnits, parseUnits } from 'viem';
import { STABLE_COINS } from '@constants/addresses';
import _Decimal from 'decimal.js-light';

import JSBI from 'jsbi';
import toFormat from 'toformat';
import { Token, TokenType } from '@types';
import { DCAPositionToken, TokenVariant } from '@mean-finance/sdk';
import { isUndefined } from 'lodash';

const Decimal = toFormat(_Decimal);

const toSignificant = (
  currency: string,
  decimals: number,
  significantDigits = 6,
  format: { groupSeparator: string } = { groupSeparator: '' }
): string => {
  const decimalScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals));
  const numerator = JSBI.BigInt(currency);
  const denominator = JSBI.BigInt(decimalScale);

  Decimal.set({
    precision: 20,
    rounding: Decimal.ROUND_UP,
  });

  const baseNumber = new Decimal(numerator.toString()).div(denominator.toString()).toFixed(0);
  const nonDecimalPlaces = baseNumber === '0' ? 0 : baseNumber.toString().length;

  Decimal.set({
    precision: nonDecimalPlaces + significantDigits + 1,
    rounding: Decimal.ROUND_UP,
  });

  const quotient = new Decimal(numerator.toString())
    .div(denominator.toString())
    .toSignificantDigits(nonDecimalPlaces + significantDigits);
  return quotient.toFormat(quotient.decimalPlaces(), format);
};

export const toSignificantFromBigDecimal = (
  currency: string | undefined,
  significantDigits = 6,
  threshold = 0.0001,
  format: object = { groupSeparator: '' }
): string => {
  if (isUndefined(currency)) {
    return '-';
  }

  const quotient = new Decimal(currency).toSignificantDigits(significantDigits);

  if (quotient.lessThan(threshold)) {
    return `<${threshold}`;
  }

  return quotient.toFormat(quotient.decimalPlaces(), format);
};

export function formatCurrencyAmount(amount: bigint | undefined, token: Token, sigFigs = 6, maxDecimals = 3) {
  if (!amount) {
    return '-';
  }
  const decimalScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(token.decimals));

  if (JSBI.equal(JSBI.BigInt(amount.toString()), JSBI.BigInt(0))) {
    return '0';
  }

  if (new Decimal(amount.toString()).div(decimalScale.toString()).lessThan(new Decimal(1).div(10 ** maxDecimals))) {
    return `<${new Decimal(1).div(10 ** maxDecimals).toString()}`;
  }

  return toSignificant(amount.toString(), token.decimals, sigFigs);
}
/* eslint-enable */

export const emptyTokenWithAddress: (address: string, type?: TokenType) => Token = (
  address: string,
  type?: TokenType
) => ({
  decimals: 18,
  chainId: 1,
  address,
  name: '',
  symbol: '',
  type: type || TokenType.BASE,
  underlyingTokens: [],
});

export const emptyTokenWithLogoURI: (logoURI: string) => Token = (logoURI: string) => ({
  decimals: 18,
  chainId: 1,
  address: '0x00000000000000000',
  name: '',
  symbol: '',
  type: TokenType.BASE,
  underlyingTokens: [],
  logoURI,
});

export const emptyTokenWithSymbol: (symbol: string) => Token = (symbol: string) => ({
  decimals: 18,
  chainId: 1,
  symbol,
  name: '',
  address: '0x00000000000000000',
  type: TokenType.BASE,
  underlyingTokens: [],
});

export const emptyTokenWithDecimals: (decimals: number) => Token = (decimals: number) => ({
  decimals,
  chainId: 1,
  symbol: '',
  name: '',
  address: '0x00000000000000000',
  type: TokenType.BASE,
  underlyingTokens: [],
});

export const parseUsdPrice = (from?: Token | null, amount?: bigint | null, usdPrice?: bigint) => {
  if (!from || !amount) {
    return 0;
  }

  if (amount <= 0n || !usdPrice) {
    return 0;
  }

  const multiplied = amount * usdPrice;

  return parseFloat(formatUnits(multiplied, from.decimals + 18));
};

export const usdPriceToToken = (token?: Token | null, usdNeeded?: number, usdPrice?: bigint) => {
  if (!token || !usdNeeded) {
    return 0n;
  }

  const needed = parseUnits(usdNeeded.toString(), 18);
  const tokenUsdMagnitude = 10n ** BigInt(token.decimals + 18);
  const usdMagnitude = 10n ** 18n;

  if (STABLE_COINS.includes(token.symbol)) {
    return (needed * tokenUsdMagnitude) / parseUnits('1', 18) / usdMagnitude;
  }

  if (needed <= 0n || !usdPrice) {
    return 0n;
  }

  return (needed * tokenUsdMagnitude) / usdPrice / usdMagnitude;
};

export const toToken: (overrides: {
  address?: string;
  type?: TokenType;
  decimals?: number;
  chainId?: number;
  symbol?: string;
  name?: string;
  underlyingTokens?: Token[];
  logoURI?: string;
}) => Token = ({ address, decimals, chainId, symbol, name, underlyingTokens, type, logoURI }) => ({
  decimals: decimals || 18,
  chainId: chainId || 1,
  address: address || '',
  name: name || '',
  symbol: symbol || '',
  type: type || TokenType.BASE,
  underlyingTokens: underlyingTokens || [],
  logoURI,
});

export const toDcaPositionToken: (overrides: {
  address?: string;
  type?: TokenType;
  decimals?: number;
  chainId?: number;
  symbol?: string;
  name?: string;
  underlyingTokens?: Token[];
  logoURI?: string;
  variant?: TokenVariant;
}) => DCAPositionToken = ({ address, decimals, chainId, symbol, name, underlyingTokens, type, logoURI, variant }) => ({
  decimals: decimals || 18,
  chainId: chainId || 1,
  address: address || '',
  name: name || '',
  symbol: symbol || '',
  type: type || TokenType.BASE,
  underlyingTokens: underlyingTokens || [],
  logoURI,
  variant: variant || {
    type: 'original',
    id: address || '',
  },
});
