import { useAppDispatch, useAppSelector } from '@state/hooks';
import { RootState } from '../index';
import { Address, AmountsOfToken, ChainId, Token } from '@types';
import { isNil, isUndefined } from 'lodash';
import React from 'react';
import { IntervalSetActions } from '@constants/timing';
import useInterval from '@hooks/useInterval';
import useTimeout from '@hooks/useTimeout';
import { updateTokens } from './actions';
import { formatCurrencyAmount, isSameToken, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { useIntl } from 'react-intl';

export interface TokenBalance {
  balance?: bigint;
  balanceUsd?: bigint;
}
export interface TokenBalances {
  [tokenAddress: string]: TokenBalance;
}

export interface AllWalletsBalances {
  [walletAddress: Address]: number;
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

export function useUsdBalances(filter?: { chainId?: number; tokens?: Token[] }): {
  isLoading: boolean;
  usdBalances: AllWalletsBalances;
} {
  const { isLoadingAllBalances, balances: allBalances } = useAppSelector((state: RootState) => state.balances);

  return React.useMemo(() => {
    const usdBalances: AllWalletsBalances = {};

    Object.entries(allBalances).forEach(([chainId, chainBalances]) => {
      if (filter && !isNil(filter.chainId) && Number(chainId) !== filter.chainId) return;
      Object.values(chainBalances.balancesAndPrices || {}).forEach(({ token, balances, price }) => {
        if (
          filter &&
          !isNil(filter.tokens) &&
          !!filter.tokens.length &&
          !filter.tokens.some((t) => isSameToken(t, token))
        )
          return;
        Object.entries(balances).forEach(([address, balance]: [Address, bigint]) => {
          const usdBalance = parseUsdPrice(token, balance, parseNumberUsdPriceToBigInt(price));
          usdBalances[address] = (usdBalances[address] || 0) + usdBalance;
        });
      });
    });

    return {
      usdBalances,
      isLoading: isLoadingAllBalances || Object.values(allBalances).some((chain) => chain.isLoadingChainPrices),
    };
  }, [allBalances, isLoadingAllBalances, filter]);
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
    return { balance: { amount: 0n, amountInUnits: '0.0', amountInUSD: '0.00' }, isLoading: false };
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

export function useStoredNativeBalance(chainId: number) {
  const intl = useIntl();
  const allBalances = useAppSelector((state: RootState) => state.balances);
  const protocolToken = getProtocolToken(chainId);

  const protocolTokenBalances = allBalances.balances[chainId]?.balancesAndPrices?.[PROTOCOL_TOKEN_ADDRESS];

  return Object.values(protocolTokenBalances?.balances || {}).map((balance) => ({
    amount: balance,
    amountInUnits: formatCurrencyAmount({ amount: balance, token: protocolToken, intl }),
    amountInUSD: parseUsdPrice(
      protocolToken,
      balance,
      parseNumberUsdPriceToBigInt(protocolTokenBalances?.price)
    ).toFixed(2),
  }));
}

export function useNativeBalancesSnapshot() {
  const allBalances = useAppSelector((state: RootState) => state.balances);
  const [snapshot, setSnapshot] = React.useState<Record<ChainId, { [walletAddress: Address]: bigint }>>({});

  const balances: Record<ChainId, { [walletAddress: Address]: bigint }> = {};

  Object.entries(allBalances.balances).forEach(([chainId, chainBalances]) => {
    const protocolTokenBalances = chainBalances.balancesAndPrices?.[PROTOCOL_TOKEN_ADDRESS];
    balances[Number(chainId)] = {
      ...balances[Number(chainId)],
      ...(protocolTokenBalances?.balances || {}),
    };
  });

  const updateNativeBalancesSnapshot = () => {
    setSnapshot(balances);
  };

  React.useEffect(() => {
    if (Object.keys(balances).length > 0 && Object.keys(snapshot).length === 0) {
      updateNativeBalancesSnapshot();
    }
  }, [balances]);

  return React.useMemo(
    () => ({
      nativeBalancesSnapshot: snapshot,
      updateNativeBalancesSnapshot,
    }),
    [snapshot, updateNativeBalancesSnapshot]
  );
}

export function useTotalTokenBalance(token?: Token) {
  const intl = useIntl();
  const allBalances = useAppSelector((state: RootState) => state.balances);

  if (!token) return { amount: 0n, amountInUnits: '0.0', amountInUSD: '0.00' };

  const tokenBalances = allBalances.balances[token.chainId]?.balancesAndPrices?.[token.address];
  const totalAmount = Object.values(tokenBalances?.balances || {}).reduce((acc, balance) => acc + balance, 0n);
  return {
    amount: totalAmount,
    amountInUnits: formatCurrencyAmount({ amount: totalAmount, token, intl }),
    amountInUSD: parseUsdPrice(token, totalAmount, parseNumberUsdPriceToBigInt(tokenBalances?.price)).toFixed(2),
  };
}
