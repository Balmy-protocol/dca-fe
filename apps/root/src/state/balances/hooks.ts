import { useAppDispatch, useAppSelector } from '@state/hooks';
import { RootState } from '../index';
import { Address, AmountsOfToken, ChainId, Token, TokenAddress } from '@types';
import { isNil, isUndefined } from 'lodash';
import React from 'react';
import { IntervalSetActions } from '@constants/timing';
import useInterval from '@hooks/useInterval';
import useTimeout from '@hooks/useTimeout';
import { updateTokens } from './actions';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { useIntl } from 'react-intl';

export interface TokenBalance {
  balance?: bigint;
  balanceUsd?: bigint;
}
export interface TokenBalances {
  [tokenAddress: string]: TokenBalance;
}

export function useAllBalances() {
  return useAppSelector((state: RootState) => state.balances);
}

export function useWalletBalances(
  walletAddress: Address | undefined,
  chainId: number
): { balances: TokenBalances; isLoadingBalances: boolean; isLoadingPrices: boolean } {
  const { isLoadingAllBalances, balances: allBalances } = useAppSelector((state: RootState) => state.balances);
  const { balancesAndPrices = {}, isLoadingChainPrices } = allBalances[chainId] || {};

  const tokenBalances: TokenBalances = Object.entries(balancesAndPrices).reduce((acc, [tokenAddress, tokenInfo]) => {
    const balance = walletAddress && tokenInfo.balances[walletAddress] ? tokenInfo.balances[walletAddress] : undefined;
    const price = !isNil(tokenInfo.price) ? parseNumberUsdPriceToBigInt(tokenInfo.price) : undefined;
    const balanceUsd = (price && !isUndefined(balance) && balance * price) || undefined;

    // eslint-disable-next-line no-param-reassign
    acc[tokenAddress] = { balance, balanceUsd };
    return acc;
  }, {} as TokenBalances);

  return { balances: tokenBalances, isLoadingBalances: isLoadingAllBalances, isLoadingPrices: isLoadingChainPrices };
}

export function useTokenBalance({
  token,
  walletAddress,
  shouldAutoFetch,
}: {
  token: Token | null;
  walletAddress?: string;
  shouldAutoFetch?: boolean;
}): { balance?: AmountsOfToken; isLoading: boolean } {
  const allBalances = useAppSelector((state: RootState) => state.balances);
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const fetchAndUpdateToken = React.useCallback(async () => {
    if (token && walletAddress) {
      await dispatch(updateTokens({ tokens: [token], chainId: token.chainId, walletAddress }));
    }
  }, [token, walletAddress]);

  const intervalDelay = shouldAutoFetch ? IntervalSetActions.selectedTokenBalance : null;
  useInterval(fetchAndUpdateToken, intervalDelay);
  useTimeout(fetchAndUpdateToken, walletAddress && token ? 0 : null);

  if (!token || !walletAddress) {
    return { balance: undefined, isLoading: false };
  }

  const chainBalances = allBalances.balances[token.chainId] || {};
  const isLoading = allBalances.isLoadingAllBalances;
  const balanceAmount = chainBalances.balancesAndPrices?.[token.address]?.balances?.[walletAddress.toLocaleLowerCase()];

  if (isUndefined(balanceAmount)) {
    return { balance: { amount: 0n, amountInUnits: '0', amountInUSD: '0' }, isLoading: false };
  }

  const price = chainBalances.balancesAndPrices?.[token.address].price;

  const balance: AmountsOfToken = {
    amount: balanceAmount,
    amountInUnits: formatCurrencyAmount({ amount: balanceAmount, token, intl }),
    amountInUSD:
      (!isUndefined(price) && parseUsdPrice(token, balanceAmount, parseNumberUsdPriceToBigInt(price)).toFixed(2)) ||
      undefined,
  };

  return { balance, isLoading };
}

export function useTokensBalances(
  tokens: Token[],
  walletAddress: string
): { balances: Record<ChainId, Record<TokenAddress, bigint>>; isLoadingBalances: boolean } {
  const allBalances = useAppSelector((state: RootState) => state.balances);
  const isLoadingBalances = allBalances.isLoadingAllBalances;

  const balances = tokens?.reduce((acc, token) => {
    const tokenBalance =
      allBalances.balances[token.chainId]?.balancesAndPrices?.[token.address]?.balances?.[walletAddress];
    if (!acc[token.chainId]) {
      // eslint-disable-next-line no-param-reassign
      acc[token.chainId] = {};
    }

    // eslint-disable-next-line no-param-reassign
    acc[token.chainId][token.address] = tokenBalance;

    return acc;
  }, {} as Record<ChainId, Record<TokenAddress, bigint>>);

  return { balances, isLoadingBalances };
}

export function usePortfolioPrices(tokens: Token[]): Record<Address, { price?: number; isLoading: boolean }> {
  const allBalances = useAppSelector((state: RootState) => state.balances);

  const prices: Record<Address, { price?: number; isLoading: boolean }> = {};
  tokens.forEach((token) => {
    prices[token.address] = {
      isLoading: allBalances.balances[token.chainId]?.isLoadingChainPrices,
      price: allBalances.balances[token.chainId]?.balancesAndPrices?.[token.address]?.price,
    };
  });

  return prices;
}

export function useStoredNativePrices(chains: number[]): Record<ChainId, number | undefined> {
  const allBalances = useAppSelector((state: RootState) => state.balances);

  const prices: Record<ChainId, number | undefined> = {};
  chains.forEach((chainId) => {
    prices[chainId] = allBalances.balances[chainId]?.balancesAndPrices?.[PROTOCOL_TOKEN_ADDRESS]?.price;
  });

  return prices;
}
