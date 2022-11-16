/* eslint-disable */
import { TOKEN_TYPE_BASE } from 'config';
import _Decimal from 'decimal.js-light';
import { BigNumber } from 'ethers';
import JSBI from 'jsbi';
import toFormat from 'toformat';
import { Token, TokenType } from 'types';

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
    rounding: Decimal.ROUND_DOWN,
  });

  const baseNumber = new Decimal(numerator.toString()).div(denominator.toString()).toFixed(0);
  const nonDecimalPlaces = baseNumber === '0' ? 0 : baseNumber.toString().length;

  Decimal.set({
    precision: nonDecimalPlaces + significantDigits + 1,
    rounding: Decimal.ROUND_DOWN,
  });

  const quotient = new Decimal(numerator.toString())
    .div(denominator.toString())
    .toSignificantDigits(nonDecimalPlaces + significantDigits);
  return quotient.toFormat(quotient.decimalPlaces(), format);
};

export const toSignificantFromBigDecimal = (
  currency: string,
  significantDigits = 6,
  format: object = { groupSeparator: '' }
): string => {
  const quotient = new Decimal(currency).toSignificantDigits(significantDigits);
  return quotient.toFormat(quotient.decimalPlaces(), format);
};

export function formatCurrencyAmount(amount: BigNumber | undefined, token: Token, sigFigs = 6, maxDecimals = 3) {
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
  type: type || TOKEN_TYPE_BASE,
  underlyingTokens: [],
});

export const emptyTokenWithLogoURI: (logoURI: string) => Token = (logoURI: string) => ({
  decimals: 18,
  chainId: 1,
  address: '0x00000000000000000',
  name: '',
  symbol: '',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
  logoURI,
});

export const emptyTokenWithSymbol: (symbol: string) => Token = (symbol: string) => ({
  decimals: 18,
  chainId: 1,
  symbol,
  name: '',
  address: '0x00000000000000000',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
});

export const emptyTokenWithDecimals: (decimals: number) => Token = (decimals: number) => ({
  decimals,
  chainId: 1,
  symbol: '',
  name: '',
  address: '0x00000000000000000',
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
});
