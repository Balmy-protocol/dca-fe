import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';
import { BigNumber } from 'ethers';
import { parseUnits } from '@ethersproject/units';

interface TokenBalances {
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
): { balances: TokenBalances; isLoading: boolean } {
  const { isLoading, ...allBalances } = useAllBalances();
  const chainBalances = allBalances[chainId] || {};
  const balances: TokenBalances = {};

  Object.entries(chainBalances).forEach(([tokenAddress, tokenInfo]) => {
    const balance = tokenInfo.balances[walletAddress] || BigNumber.from(0);
    const price = tokenInfo.price ? parseUnits(tokenInfo.price.toFixed(18), 18) : undefined;
    const balanceUsd = price ? balance.mul(price) : undefined;

    balances[tokenAddress] = { balance, balanceUsd };
  });

  return { balances, isLoading };
}
