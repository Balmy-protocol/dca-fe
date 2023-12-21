import React from 'react';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';

import useAccount from './useAccount';
import useSdkService from './useSdkService';
import useInterval from './useInterval';

function useSdkAllowances(
  tokenChecks: Record<string, string> | undefined | null,
  chainId: number
): [Record<string, Record<string, bigint>> | undefined, boolean, string?] {
  const account = useAccount();
  const sdkService = useSdkService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: Record<string, Record<string, bigint>>;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const hasPendingTransactions = useHasPendingTransactions();
  const prevResult = usePrevious(result, false);

  const fetchAllowances = React.useCallback(() => {
    async function callPromise() {
      if (tokenChecks) {
        try {
          const promiseResult = await sdkService.getMultipleAllowances(tokenChecks, account, chainId);
          setState({ isLoading: false, result: promiseResult, error: undefined });
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    setState({ isLoading: true, result: undefined, error: undefined });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    callPromise();
  }, [tokenChecks, isLoading, result, error, hasPendingTransactions, account, sdkService, chainId]);

  useInterval(fetchAllowances, 10000);
  if (!tokenChecks || !Object.keys(tokenChecks).length) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useSdkAllowances;
