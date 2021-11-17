import _Decimal from 'decimal.js-light';
import { BigNumber } from 'ethers';
import JSBI from 'jsbi';
import toFormat from 'toformat';
import { Token } from 'types';

const Decimal = toFormat(_Decimal);

const toSignificant = (
  currency: string,
  decimals: number,
  significantDigits = 6,
  format: object = { groupSeparator: '' }
): string => {
  const decimalScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals));
  const numerator = JSBI.BigInt(currency);
  const denominator = JSBI.BigInt(decimalScale);

  Decimal.set({
    precision: significantDigits + 1,
    rounding: Decimal.ROUND_DOWN,
  });
  const quotient = new Decimal(numerator.toString()).div(denominator.toString()).toSignificantDigits(significantDigits);
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

export function formatCurrencyAmount(amount: BigNumber | undefined, token: Token, sigFigs = 6) {
  if (!amount) {
    return '-';
  }
  const decimalScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(token.decimals));

  if (JSBI.equal(JSBI.BigInt(amount.toString()), JSBI.BigInt(0))) {
    return '0';
  }

  if (new Decimal(amount.toString()).div(decimalScale.toString()).lessThan(new Decimal(1).div(100000))) {
    return '<0.00001';
  }

  return toSignificant(amount.toString(), token.decimals, sigFigs);
}
