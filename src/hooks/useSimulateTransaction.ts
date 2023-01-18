import React from 'react';
import isEqual from 'lodash/isEqual';
import { BlowfishResponse } from 'types';
import debounce from 'lodash/debounce';
import usePrevious from 'hooks/usePrevious';
import { QuoteTx } from '@mean-finance/sdk/dist/services/quotes/types';
import useSimulationService from './useSimulationService';

export const ALL_SWAP_OPTIONS_FAILED = 'all swap options failed';

function useSimulateTransaction(
  tx?: QuoteTx,
  chainId?: number,
  skip?: boolean
): [BlowfishResponse | undefined, boolean, string | undefined, () => void] {
  const simulationService = useSimulationService();
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: BlowfishResponse;
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const txData = tx?.data.toString();
  const prevTxData = usePrevious(tx?.data.toString());
  const prevResult = usePrevious(result);

  const debouncedCall = React.useCallback(
    debounce(async (debouncedTx?: QuoteTx, debouncedChainId?: number) => {
      if (debouncedTx && debouncedChainId) {
        setState({ isLoading: true, result: undefined, error: undefined });

        try {
          const promiseResult = await simulationService.simulateTransaction(debouncedTx, debouncedChainId);

          if (promiseResult) {
            setState({ result: promiseResult, error: undefined, isLoading: false });
          } else {
            setState({ result: undefined, error: ALL_SWAP_OPTIONS_FAILED, isLoading: false });
          }
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }, 500),
    [setState]
  );

  const fetchOptions = React.useCallback(() => debouncedCall(tx, chainId), [tx, chainId]);

  React.useEffect(() => {
    if (!skip && ((!isLoading && !result && !error) || !isEqual(prevTxData, txData))) {
      if (txData) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchOptions();
      }
    }
  }, [prevTxData, txData, isLoading, skip, result, error, fetchOptions]);

  if (!tx) {
    return [undefined, false, undefined, fetchOptions];
  }

  const resultToReturn = !error ? result || prevResult : undefined;

  return [resultToReturn, isLoading, error, fetchOptions];
}

export default useSimulateTransaction;
