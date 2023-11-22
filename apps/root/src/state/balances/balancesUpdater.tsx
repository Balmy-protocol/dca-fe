import { IntervalSetActions } from '@constants/timing';
import { useAppDispatch } from '@hooks/state';
import useInterval from '@hooks/useInterval';
import React from 'react';
import { useAllBalances } from './hooks';
import { fetchBalancesForChain, fetchPricesForChain } from './actions';
import useTokenListByChainId from '@hooks/useTokenListByChainId';

const BalancesUpdater = () => {
  const dispatch = useAppDispatch();
  const tokenListByChainId = useTokenListByChainId();
  const balances = useAllBalances();

  const updateBalances = React.useCallback(async () => {
    const balancePromises = Object.entries(tokenListByChainId).map(async ([chainId, tokenListByChain]) =>
      dispatch(fetchBalancesForChain({ chainId: Number(chainId), tokenList: tokenListByChain }))
    );

    await Promise.all(balancePromises);
  }, [tokenListByChainId]);

  const updatePrices = React.useCallback(async () => {
    const chainsInUse = Object.keys(balances);
    const pricePromises = chainsInUse.map((chainId) => dispatch(fetchPricesForChain({ chainId: Number(chainId) })));
    await Promise.all(pricePromises);
  }, [balances]);

  useInterval(updateBalances, IntervalSetActions.balance);
  useInterval(updatePrices, IntervalSetActions.price);
  return null;
};

export default BalancesUpdater;
