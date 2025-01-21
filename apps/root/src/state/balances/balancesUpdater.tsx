import { IntervalSetActions } from '@constants/timing';
import { useAppDispatch } from '@hooks/state';
import useInterval from '@hooks/useInterval';
import { updateBalancesPeriodically } from './actions';
import useTokenListByChainId from '@hooks/useTokenListByChainId';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import React from 'react';

const BalancesUpdater = () => {
  const dispatch = useAppDispatch();
  const tokenListByChainId = useTokenListByChainId({ curateList: true, filter: true });
  const isLoadingAllTokenLists = useIsLoadingAllTokenLists();
  const updateInterval = IntervalSetActions.balance;
  const updatingBalances = React.useRef(false);

  const updateBalancesAndPrices = React.useCallback(() => {
    if (!isLoadingAllTokenLists && !updatingBalances.current) {
      updatingBalances.current = true;
      dispatch(updateBalancesPeriodically({ tokenListByChainId, updateInterval })).then(() => {
        updatingBalances.current = false;
      });
    }
  }, [isLoadingAllTokenLists]);

  useInterval(updateBalancesAndPrices, updateInterval);

  return null;
};

export default BalancesUpdater;
