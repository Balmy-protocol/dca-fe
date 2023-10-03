import React, { useCallback } from 'react';
import { Token } from '@types';
import usePrevious from '@hooks/usePrevious';
import { IntervalSetActions } from '@constants/timing';
import { BigNumber } from 'ethers';
import useSdkService from './useSdkService';
import useInterval from './useInterval';

function useBalance(from: Token | undefined | null): [BigNumber | undefined, boolean, string?] {
  const sdkService = useSdkService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: BigNumber;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });
  const prevResult = usePrevious(result, false);

  const fetchBalance = useCallback(() => {
    async function callPromise() {
      if (from) {
        try {
          const promiseResult = await sdkService.getMultipleBalances([from]);

          if (!promiseResult[from.chainId][from.address]) {
            setState({ result: undefined, error: 'Could not find balance for token', isLoading: false });
          } else {
            setState({ isLoading: false, result: promiseResult[from.chainId][from.address], error: undefined });
          }
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if (!isLoading) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, isLoading, sdkService]);

  useInterval(fetchBalance, IntervalSetActions.balance);

  return React.useMemo(() => {
    if (!from) {
      return [undefined, false, undefined];
    }

    return [result || prevResult, isLoading, error];
  }, [error, from, isLoading, prevResult, result]);
}

export default useBalance;
