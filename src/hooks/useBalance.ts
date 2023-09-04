import React, { useCallback } from 'react';
import { Token } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { IntervalSetActions } from '@constants/timing';
import { BigNumber } from 'ethers';
import useSelectedNetwork from './useSelectedNetwork';
import useAccount from './useAccount';
import useSdkService from './useSdkService';
import useInterval from './useInterval';

function useBalance(from: Token | undefined | null): [BigNumber | undefined, boolean, string?] {
  const account = useAccount();
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

  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(account);
  const currentNetwork = useSelectedNetwork();
  const prevCurrentNetwork = usePrevious(currentNetwork);
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

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(account, prevAccount) ||
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      !isEqual(currentNetwork.chainId, prevCurrentNetwork?.chainId)
    ) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    from,
    prevFrom,
    isLoading,
    result,
    error,
    hasPendingTransactions,
    prevAccount,
    account,
    prevCurrentNetwork?.chainId,
    currentNetwork?.chainId,
    prevFrom,
    sdkService,
    prevPendingTrans,
  ]);

  useInterval(fetchBalance, IntervalSetActions.balance);

  if (!from) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useBalance;
