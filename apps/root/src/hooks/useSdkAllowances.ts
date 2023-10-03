import React, { useCallback } from 'react';
import usePrevious from '@hooks/usePrevious';
import { IntervalSetActions } from '@constants/timing';
import { BigNumber } from 'ethers';
import useSdkService from './useSdkService';
import useInterval from './useInterval';

function useSdkAllowances(
  tokenChecks: Record<string, string> | undefined | null,
  chainId: number
): [Record<string, Record<string, BigNumber>> | undefined, boolean, string?] {
  const sdkService = useSdkService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: Record<string, Record<string, BigNumber>>;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const prevResult = usePrevious(result, false);

  const fetchAllowances = useCallback(() => {
    async function callPromise() {
      if (tokenChecks) {
        try {
          const promiseResult = await sdkService.getMultipleAllowances(tokenChecks, chainId);
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
  }, [chainId, isLoading, sdkService, tokenChecks]);

  useInterval(fetchAllowances, IntervalSetActions.allowance);

  return React.useMemo(() => {
    if (!tokenChecks || !Object.keys(tokenChecks).length) {
      return [undefined, false, undefined];
    }

    return [result || prevResult, isLoading, error];
  }, [error, isLoading, prevResult, result, tokenChecks]);
}

export default useSdkAllowances;
