import React, { useCallback } from 'react';
import { Token } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { IntervalSetActions } from '@constants/timing';
import { BigNumber } from 'ethers';
import useCurrentNetwork from './useCurrentNetwork';
import useAccount from './useAccount';
import useSdkService from './useSdkService';
import useInterval from './useInterval';

function useSdkBalances(
  tokens: Token[] | undefined | null
): [Record<number, Record<string, BigNumber>> | undefined, boolean, string?] {
  const account = useAccount();
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

  const hasPendingTransactions = useHasPendingTransactions();
  const prevTokens = usePrevious(tokens);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(account);
  const currentNetwork = useCurrentNetwork();
  const prevCurrentNetwork = usePrevious(currentNetwork);
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

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevTokens, tokens) ||
      !isEqual(account, prevAccount) ||
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      !isEqual(prevCurrentNetwork?.chainId, currentNetwork.chainId)
    ) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    tokens,
    prevTokens,
    isLoading,
    result,
    error,
    hasPendingTransactions,
    prevAccount,
    account,
    prevCurrentNetwork?.chainId,
    currentNetwork.chainId,
    sdkService,
    prevPendingTrans,
  ]);

  useInterval(fetchSdkBalances, IntervalSetActions.balance);

  if (!tokens || !tokens.length) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useSdkBalances;
