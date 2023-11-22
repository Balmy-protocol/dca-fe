import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';
import { BigNumber } from 'ethers';
import { parseUnits } from '@ethersproject/units';

export interface TokenBalances {
  [tokenAddress: string]: {
    balance: BigNumber;
    balanceUsd: BigNumber;
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
    const price = tokenInfo.price ? parseUnits(tokenInfo.price.toFixed(18), 18) : BigNumber.from(0);
    const balanceUsd = balance.mul(price);

    tokenBalances[tokenAddress] = { balance, balanceUsd };
  });
  return { balances: tokenBalances, isLoadingBalances, isLoadingPrices };
}
