/* eslint-disable */
import { Address, formatUnits, parseUnits } from 'viem';
import { STABLE_COINS, getGhTokenListLogoUrl } from '@constants/addresses';
import _Decimal from 'decimal.js-light';

import JSBI from 'jsbi';
import toFormat from 'toformat';
import { NetworkStruct, Token, TokenType } from '@types';
import { DCAPositionToken, TokenVariant } from '@balmy/sdk';
import { isUndefined } from 'lodash';
import { useIntl } from 'react-intl';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';

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
  minFractionDigits = 0,
}: {
  amount: bigint | undefined;
  localize?: boolean;
  token: Token;
  sigFigs?: number;
  maxDecimals?: number;
  intl?: ReturnType<typeof useIntl>;
  minFractionDigits?: number;
}) {
  if (!amount && amount !== 0n) {
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
  const paddedDecimal = (decimal || '').padEnd(minFractionDigits, '0');

  const formattedInt = intl.formatNumber(BigInt(int), {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${formattedInt}${paddedDecimal ? `${getDecimalSeparator(intl)}${paddedDecimal}` : ''}`;
}

export function formatUsdAmount({ amount, intl }: { amount?: number | string; intl: ReturnType<typeof useIntl> }) {
  return formatCurrencyAmount({
    amount: !isUndefined(amount) ? parseUnits((Number(amount) || 0).toFixed(2), 2) : amount,
    token: emptyTokenWithDecimals(2),
    intl,
    minFractionDigits: 2,
  });
}

export function parseExponentialNumberToString(number: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    useGrouping: false,
    maximumFractionDigits: 20,
    maximumSignificantDigits: 20,
  });

  return formatter.format(number);
}

/* eslint-enable */

export const emptyTokenWithAddress: (address: string, type?: TokenType) => Token = (
  address: string,
  type?: TokenType
) => ({
  decimals: 18,
  chainId: 1,
  address: address as Address,
  name: '',
  symbol: '',
  type: type || TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
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
  chainAddresses: [],
});

export const emptyTokenWithSymbol: (symbol: string) => Token = (symbol: string) => ({
  decimals: 18,
  chainId: 1,
  symbol,
  name: '',
  address: '0x00000000000000000',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
});

export const emptyTokenWithDecimals: (decimals: number) => Token = (decimals: number) => ({
  decimals,
  chainId: 1,
  symbol: '',
  name: '',
  address: '0x00000000000000000',
  type: TokenType.BASE,
  underlyingTokens: [],
  chainAddresses: [],
});

export const parseUsdPrice = (from?: Token | null, amount?: bigint | null, usdPrice?: bigint) => {
  if (!from || !amount) {
    return 0;
  }

  if (amount <= 0n || !usdPrice) {
    return 0;
  }

  const multiplied = amount * usdPrice;

  return parseFloat(Number(formatUnits(multiplied, from.decimals + 18)).toFixed(2));
};

export const parseBaseUsdPriceToNumber = (usdPrice?: bigint) => {
  if (!usdPrice) {
    return 0;
  }

  return parseFloat(formatUnits(usdPrice, 18));
};

export const parseNumberUsdPriceToBigInt = (usdPrice?: number) => {
  if (!usdPrice) {
    return 0n;
  }

  return parseUnits(usdPrice.toFixed(18), 18);
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
  price?: number;
  variant?: TokenVariant;
  chainAddresses?: { chainId: number; address: Address }[];
}) => Token = ({
  address,
  decimals,
  chainId,
  symbol,
  name,
  underlyingTokens,
  type,
  logoURI,
  price,
  variant,
  chainAddresses,
}) => ({
  decimals: decimals || 18,
  chainId: chainId || 1,
  address: (address?.toLowerCase() || '0x') as Address,
  name: name || '',
  symbol: symbol || '',
  type: type || TokenType.BASE,
  underlyingTokens:
    underlyingTokens ||
    (variant &&
      variant.type === 'yield' && [
        toToken({ ...variant, type: TokenType.YIELD_BEARING_SHARE, address: variant.id, chainId, decimals }),
      ]) ||
    [],
  logoURI,
  price,
  chainAddresses: chainAddresses || [],
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
  address: (address || '0x') as Address,
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

export const getNetworkCurrencyTokens = (network: NetworkStruct) => {
  const nativeCurrencyToken = toToken({
    ...network?.nativeCurrency,
    logoURI: network.nativeCurrency.logoURI || getGhTokenListLogoUrl(network.chainId, PROTOCOL_TOKEN_ADDRESS),
  });
  const mainCurrencyToken = toToken({
    address: network.mainCurrency || '',
    chainId: network.chainId,
    logoURI: getGhTokenListLogoUrl(network.chainId, 'logo'),
  });
  return { nativeCurrencyToken, mainCurrencyToken };
};

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

export const isSameToken = (tokenA: Token, tokenB: Token) =>
  tokenA.address === tokenB.address && tokenA.chainId === tokenB.chainId;

export const findEquivalentTokenById = (tokens: Token[], tokenId: string) =>
  tokens.find((token) =>
    token.chainAddresses.some((chainToken) => `${chainToken.chainId}-${chainToken.address}` === tokenId)
  );

export const getIsSameOrTokenEquivalent = (tokenA: Token, tokenB: Token) =>
  (tokenA.address === tokenB.address && tokenA.chainId === tokenB.chainId) ||
  tokenA.chainAddresses.some(
    (chainAddress) => chainAddress.address === tokenB.address && chainAddress.chainId === tokenB.chainId
  );

export const removeEquivalentFromTokensArray = (tokens: Token[]) =>
  tokens.reduce<Token[]>((acc, token) => {
    const isSameOrEquivalent = acc.some((addedToken) => getIsSameOrTokenEquivalent(addedToken, token));
    if (!isSameOrEquivalent) {
      acc.push(token);
    }
    return acc;
  }, []);

export const findTokenAnyMatch = (list: Token[], tokenString?: string) => {
  if (!tokenString) return;
  return (
    // By tokenId
    findEquivalentTokenById(list, tokenString.toLowerCase()) ||
    // By address
    list.find(
      (asset) =>
        asset.address.toLowerCase() === tokenString.toLowerCase() ||
        asset.chainAddresses.some(({ address }) => address === tokenString.toLowerCase())
    ) ||
    // By symbol
    list.find((asset) => asset.symbol.toLowerCase() === tokenString.toLowerCase())
  );
};

export const calculatePercentageChange = (currentPrice?: number, pastPrice?: number) => {
  return currentPrice && pastPrice ? (((currentPrice - pastPrice) / currentPrice) * 100).toFixed(2) : undefined;
};
