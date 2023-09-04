import React, { useCallback } from 'react';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { IntervalSetActions } from '@constants/timing';
import { BigNumber } from 'ethers';
import useAccount from './useAccount';
import useSdkService from './useSdkService';
import useInterval from './useInterval';

function useSdkAllowances(
  tokenChecks: Record<string, string> | undefined | null,
  chainId: number
): [Record<string, Record<string, BigNumber>> | undefined, boolean, string?] {
  const account = useAccount();
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

  const hasPendingTransactions = useHasPendingTransactions();
  const prevTokenChecks = usePrevious(tokenChecks);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(account);
  const prevChainId = usePrevious(chainId);
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

    if (
      (!isLoading && !result && !error) ||
      !isEqual(tokenChecks, prevTokenChecks) ||
      !isEqual(account, prevAccount) ||
      !isEqual(chainId, prevChainId) ||
      !isEqual(prevPendingTrans, hasPendingTransactions)
    ) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    tokenChecks,
    prevTokenChecks,
    isLoading,
    result,
    error,
    hasPendingTransactions,
    prevAccount,
    account,
    sdkService,
    prevPendingTrans,
    chainId,
    prevChainId,
  ]);

  useInterval(fetchAllowances, IntervalSetActions.allowance);

  if (!tokenChecks || !Object.keys(tokenChecks).length) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useSdkAllowances;
