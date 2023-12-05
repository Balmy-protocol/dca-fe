import { useAppDispatch, useAppSelector } from '@state/hooks';
import { RootState } from '../index';
import { BigNumber } from 'ethers';
import { parseUnits } from '@ethersproject/units';
import { ChainId, Token, TokenAddress } from '@types';
import { isNil } from 'lodash';
import React from 'react';
import { IntervalSetActions } from '@constants/timing';
import useInterval from '@hooks/useInterval';
import { updateTokens } from './actions';

export interface TokenBalances {
  [tokenAddress: string]: {
    balance?: BigNumber;
    balanceUsd?: BigNumber;
  };
}

export function useAllBalances() {
  return useAppSelector((state: RootState) => state.balances);
}

export function useWalletBalances(
  walletAddress: string,
  chainId: number
): { balances: TokenBalances; isLoadingBalances: boolean; isLoadingPrices: boolean } {
  const { isLoadingAllBalances, ...allBalances } = useAppSelector((state: RootState) => state.balances);
  const { balancesAndPrices = {}, isLoadingChainPrices } = allBalances[chainId] || {};

  const tokenBalances: TokenBalances = Object.entries(balancesAndPrices).reduce((acc, [tokenAddress, tokenInfo]) => {
    const balance: BigNumber | undefined = tokenInfo.balances[walletAddress];
    const price = !isNil(tokenInfo.price) ? parseUnits(tokenInfo.price.toFixed(18), 18) : undefined;
    const balanceUsd = price && balance?.mul(price);

    return {
      ...acc,
      [tokenAddress]: { balance, balanceUsd },
    };
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
}): { balance?: BigNumber; isLoading: boolean } {
  const allBalances = useAppSelector((state: RootState) => state.balances);
  const dispatch = useAppDispatch();

  const fetchAndUpdateToken = React.useCallback(async () => {
    if (token && walletAddress) {
      await dispatch(updateTokens({ tokens: [token], chainId: token.chainId, walletAddress }));
    }
  }, [token, walletAddress]);

  const intervalDelay = shouldAutoFetch ? IntervalSetActions.selectedTokenBalance : null;
  useInterval(fetchAndUpdateToken, intervalDelay);

  if (!token || !walletAddress) {
    return { balance: undefined, isLoading: false };
  }

  const chainBalances = allBalances[token.chainId] || {};
  const isLoading = allBalances.isLoadingAllBalances;
  const balance =
    chainBalances.balancesAndPrices?.[token.address]?.balances?.[walletAddress.toLocaleLowerCase()] ??
    (!isLoading && BigNumber.from(0));

  return { balance, isLoading };
}

export function useTokensBalances(
  tokens: Token[],
  walletAddress: string
): { balances: Record<ChainId, Record<TokenAddress, BigNumber>>; isLoadingBalances: boolean } {
  const allBalances = useAppSelector((state: RootState) => state.balances);
  const isLoadingBalances = allBalances.isLoadingAllBalances;

  const balances = tokens?.reduce(
    (acc, token) => {
      const tokenBalance = allBalances[token.chainId]?.balancesAndPrices?.[token.address]?.balances?.[walletAddress];
      return {
        ...acc,
        [token.chainId]: {
          ...acc[token.chainId],
          [token.address]: tokenBalance,
        },
      };
    },
    {} as Record<ChainId, Record<TokenAddress, BigNumber>>
  );

  return { balances, isLoadingBalances };
}
