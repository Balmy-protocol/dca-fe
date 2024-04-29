/* eslint-disable */
// This is all Duplicated from the `root` app, we need to get rid of this once we mvoe some commons to utils packages
import { Token } from 'common-types';
import isUndefined from 'lodash/isUndefined';
import { useIntl } from 'react-intl';
import { parseUnits } from 'viem';
import _Decimal from 'decimal.js-light';
// @ts-expect-error toFormat does not have types
import toFormat from 'toformat';
import JSBI from 'jsbi';

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
  if (isUndefined(currency) || isNaN(Number(currency))) {
    return '-';
  }

  const quotient = new Decimal(currency).toSignificantDigits(significantDigits);

  if (quotient.lessThan(threshold)) {
    return `<${threshold}`;
  }

  return quotient.toFormat(quotient.decimalPlaces(), format);
};

export function getDecimalSeparator(intl: ReturnType<typeof useIntl>) {
  const numberWithDecimalSeparator = 1.1;
  return intl.formatNumberToParts(numberWithDecimalSeparator).find((part) => part.type === 'decimal')?.value;
}

export function formatCurrencyAmount({
  amount,
  token,
  sigFigs = 4,
  maxDecimals = 3,
  intl,
  localize = true,
}: {
  amount: bigint | undefined;
  localize?: boolean;
  token?: Token;
  sigFigs?: number;
  maxDecimals?: number;
  intl?: ReturnType<typeof useIntl>;
}) {
  if ((!amount && amount !== BigInt(0)) || !token) {
    return '-';
  }
  const decimalScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(token.decimals));

  if (JSBI.equal(JSBI.BigInt(amount.toString()), JSBI.BigInt(0))) {
    return '0';
  }

  if (new Decimal(amount.toString()).div(decimalScale.toString()).lessThan(new Decimal(1).div(10 ** maxDecimals))) {
    return `<${new Decimal(1).div(10 ** maxDecimals).toString()}`;
  }

  const significant = toSignificant(amount.toString(), token.decimals, sigFigs);

  if (!localize || !intl) {
    return significant;
  }

  const [int, decimal] = significant.split('.');

  const formattedInt = intl.formatNumber(BigInt(int), {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${formattedInt}${decimal ? `${getDecimalSeparator(intl)}${decimal}` : ''}`;
}

export function formatUsdAmount({ amount, intl }: { amount?: number | string; intl: ReturnType<typeof useIntl> }) {
  return formatCurrencyAmount({
    amount: parseUnits(Number(amount).toFixed(2) || '0', 2),
    token: { decimals: 2 } as unknown as Token,
    intl,
  });
}
/* eslint-enable */
