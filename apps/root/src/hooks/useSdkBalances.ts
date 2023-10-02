import React, { useCallback } from 'react';
import { Token } from '@types';
import usePrevious from '@hooks/usePrevious';
import { IntervalSetActions } from '@constants/timing';
import { BigNumber } from 'ethers';
import useSdkService from './useSdkService';
import useInterval from './useInterval';

function useSdkBalances(
  tokens: Token[] | undefined | null
): [Record<number, Record<string, BigNumber>> | undefined, boolean, string?] {
  const sdkService = useSdkService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: Record<number, Record<string, BigNumber>>;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });
  const prevResult = usePrevious(result, false);

  const fetchSdkBalances = useCallback(() => {
    async function callPromise() {
      if (tokens) {
        try {
          const promiseResult = await sdkService.getMultipleBalances(tokens);
          setState({ isLoading: false, result: promiseResult, error: undefined });
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
  }, [isLoading, sdkService, tokens]);

  useInterval(fetchSdkBalances, IntervalSetActions.balance);

  return React.useMemo(() => {
    if (!tokens || !tokens.length) {
      return [undefined, false, undefined];
    }

    return [result || prevResult, isLoading, error];
  }, [error, isLoading, prevResult, result, tokens]);
}

export default useSdkBalances;
