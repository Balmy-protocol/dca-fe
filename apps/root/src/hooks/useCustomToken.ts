import React, { useCallback } from 'react';
import { Token } from '@types';
import usePrevious from '@hooks/usePrevious';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { IntervalSetActions } from '@constants/timing';
import useSelectedNetwork from './useSelectedNetwork';
import usePriceService from './usePriceService';
import useSdkService from './useSdkService';
import useInterval from './useInterval';

function useCustomToken(
  tokenAddress?: string | null,
  skip?: boolean
): [{ token: Token; balance: BigNumber; balanceUsd: BigNumber } | undefined, boolean, string?] {
  const sdkService = useSdkService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: { token: Token; balance: BigNumber; balanceUsd: BigNumber };
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const priceService = usePriceService();
  const currentNetwork = useSelectedNetwork();
  const prevResult = usePrevious(result, false);

  const fetchCustomToken = useCallback(() => {
    async function callPromise() {
      if (tokenAddress) {
        try {
          const balanceResult = await sdkService.getCustomToken(tokenAddress, currentNetwork.chainId);

          if (balanceResult) {
            const priceResults = await priceService.getUsdHistoricPrice([emptyTokenWithAddress(tokenAddress)]);

            let balanceUsd = BigNumber.from(0);
            try {
              balanceUsd = (balanceResult.balance || BigNumber.from(0)).mul(
                priceResults[tokenAddress] || BigNumber.from(0)
              );
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

    if (!skip && !isLoading) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [currentNetwork.chainId, isLoading, priceService, sdkService, skip, tokenAddress]);

  useInterval(fetchCustomToken, IntervalSetActions.tokens);

  return React.useMemo(() => {
    if (!tokenAddress) {
      return [undefined, false, undefined];
    }

    return [result || prevResult, isLoading, error];
  }, [error, isLoading, prevResult, result, tokenAddress]);
}

export default useCustomToken;
