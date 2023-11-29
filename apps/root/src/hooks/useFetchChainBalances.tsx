import { RootState } from '@state';
import { useAppDispatch, useAppSelector } from '@state/hooks';
import useActiveWallet from './useActiveWallet';
import useSelectedNetwork from './useSelectedNetwork';
import { fetchPricesForChain, fetchWalletBalancesForChain, setTotalTokensLoaded } from '@state/balances/actions';
import useTokenList from './useTokenList';
import React from 'react';

export default function useFetchChainBalances(): void {
  const allBalances = useAppSelector((state: RootState) => state.balances);
  const tokenList = useTokenList({ allowAllTokens: true, filterChainId: true });
  const walletAddress = useActiveWallet()?.address || '';
  const { chainId } = useSelectedNetwork();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const totalTokensLoaded = !!allBalances[chainId]?.totalTokensLoaded?.[walletAddress];

    const fetchBalances = async () => {
      await dispatch(fetchWalletBalancesForChain({ tokenList, chainId, walletAddress }));
      await dispatch(fetchPricesForChain({ chainId }));
    };
    if (!totalTokensLoaded && walletAddress) {
      void fetchBalances();
      dispatch(setTotalTokensLoaded({ chainId, walletAddress, totalTokensLoaded: true }));
    }
  }, [walletAddress, chainId]);
}
