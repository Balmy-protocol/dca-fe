import React from 'react';
import { Token } from '@types';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';

import { emptyTokenWithAddress } from '@common/utils/currency';
import useSelectedNetwork from './useSelectedNetwork';
import usePriceService from './usePriceService';
import useSdkService from './useSdkService';
import useActiveWallet from './useActiveWallet';
import useInterval from './useInterval';
import { IntervalSetActions } from '@constants/timing';

function useCustomToken(
  tokenAddress?: string | null,
  skip?: boolean
): [{ token: Token; balance: bigint; balanceUsd: bigint } | undefined, boolean, string?] {
  const sdkService = useSdkService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: { token: Token; balance: bigint; balanceUsd: bigint };
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const priceService = usePriceService();
  const hasPendingTransactions = useHasPendingTransactions();
  const activeWallet = useActiveWallet();
  const account = activeWallet?.address;
  const currentNetwork = useSelectedNetwork();
  const prevResult = usePrevious(result, false);
  const fetchCustomToken = React.useCallback(() => {
    async function callPromise() {
      if (tokenAddress) {
        try {
          const balanceResult = await sdkService.getCustomToken(tokenAddress, currentNetwork.chainId);

          if (balanceResult) {
            const priceResults = await priceService.getUsdHistoricPrice([emptyTokenWithAddress(tokenAddress)]);

            let balanceUsd = 0n;
            try {
              balanceUsd = (balanceResult.balance || 0n) * (priceResults[tokenAddress] || 0n);
            } catch (e) {
              console.error('Error parsing balanceUsd for custom token');
            }

            const promiseResult = {
              ...balanceResult,
              balanceUsd,
            };
            setState({ isLoading: false, result: promiseResult, error: undefined });
          } else {
            setState({ isLoading: false, result: undefined, error: 'Invalid address' });
          }
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if (!skip) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [tokenAddress, skip, isLoading, result, error, hasPendingTransactions, account, priceService]);

  useInterval(fetchCustomToken, IntervalSetActions.tokens);
  if (!tokenAddress) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useCustomToken;
