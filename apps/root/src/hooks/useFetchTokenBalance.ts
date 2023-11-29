import { updateTokens } from '@state/balances/actions';
import { useAppDispatch } from '@state/hooks';
import { Token } from '@types';
import React from 'react';
import useInterval from './useInterval';
import { IntervalSetActions } from '@constants/timing';

export default function useFetchTokenBalance({
  token,
  walletAddress,
}: {
  token: Token | null;
  walletAddress?: string;
}) {
  const dispatch = useAppDispatch();
  const fetchAndUpdateTokens = React.useCallback(async () => {
    if (token && walletAddress) {
      await dispatch(updateTokens({ tokens: [token], chainId: token.chainId, walletAddress }));
    }
  }, [token, walletAddress]);
  useInterval(fetchAndUpdateTokens, IntervalSetActions.selectedTokenBalance, [token, walletAddress]);
}
