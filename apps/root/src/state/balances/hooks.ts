import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';
import { BigNumber } from 'ethers';
import { parseUnits } from '@ethersproject/units';
import { Token } from '@types';
import { isNil } from 'lodash';

export interface TokenBalances {
  [tokenAddress: string]: {
    balance: BigNumber;
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
  const allBalances = useAppSelector((state: RootState) => state.balances);
  const { balancesAndPrices = {}, isLoadingBalances, isLoadingPrices } = allBalances[chainId] || {};
  const tokenBalances: TokenBalances = {};

  Object.entries(balancesAndPrices).forEach(([tokenAddress, tokenInfo]) => {
    const balance = tokenInfo.balances[walletAddress] || BigNumber.from(0);
    const price = !isNil(tokenInfo.price) ? parseUnits(tokenInfo.price.toFixed(18), 18) : undefined;
    const balanceUsd = price && balance.mul(price);

    tokenBalances[tokenAddress] = { balance, balanceUsd };
  });
  return { balances: tokenBalances, isLoadingBalances, isLoadingPrices };
}

export function useTokenBalance(
  token: Token | null,
  walletAddress?: string
): { balance?: BigNumber; isLoading: boolean } {
  const allBalances = useAppSelector((state: RootState) => state.balances);
  if (!token || !walletAddress) {
    return { balance: undefined, isLoading: false };
  }

  const chainBalances = allBalances[token.chainId] || {};
  const isLoading = chainBalances.isLoadingBalances;
  const balance =
    chainBalances?.balancesAndPrices?.[token.address]?.balances?.[walletAddress.toLocaleLowerCase()] ??
    (!isLoading && BigNumber.from(0));

  return { balance, isLoading };
}

export function useTokensBalances(
  tokens: Token[] | null,
  walletAddress: string,
  chainId: number
): { balances: Record<string, BigNumber>; isLoadingBalances: boolean } {
  const allBalances = useAppSelector((state: RootState) => state.balances);

  tokens?.forEach((token) => {
    if (token.chainId !== chainId) {
      throw new Error('All tokens must belong to the same network');
    }
  });

  const { balancesAndPrices, isLoadingBalances } = allBalances[chainId];
  const balances: Record<string, BigNumber> = {};

  tokens?.forEach((token) => {
    balances[token.address] = balancesAndPrices?.[token.address]?.balances?.[walletAddress];
  });

  return { balances, isLoadingBalances };
}
