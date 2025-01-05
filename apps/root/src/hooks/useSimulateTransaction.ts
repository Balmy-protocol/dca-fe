import React from 'react';
import isEqual from 'lodash/isEqual';
import { BlowfishResponse, SwapOption } from '@types';
import debounce from 'lodash/debounce';
import usePrevious from '@hooks/usePrevious';
import useSimulationService from './useSimulationService';
import useAnalytics from './useAnalytics';

export const ALL_SWAP_OPTIONS_FAILED = 'all swap options failed';

function useSimulateTransaction(
  route?: Nullable<SwapOption>,
  chainId?: number,
  skip?: boolean,
  forceProviderSimulation?: boolean
): [BlowfishResponse | undefined, boolean, string | undefined, () => void] {
  const simulationService = useSimulationService();
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: BlowfishResponse;
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const txData = (route && route.tx && route.tx.data && route.tx.data.toString()) || null;
  const prevTxData = usePrevious(txData);
  const prevResult = usePrevious(result);
  const prevForceProviderSimulation = usePrevious(forceProviderSimulation);
  const { trackEvent } = useAnalytics();

  const debouncedCall = React.useCallback(
    debounce(
      async (
        debouncedRoute?: Nullable<SwapOption>,
        debouncedChainId?: number,
        debouncedForceProviderSimulation?: boolean
      ) => {
        if (debouncedRoute && debouncedRoute.tx && debouncedChainId) {
          setState({ isLoading: true, result: undefined, error: undefined });

          try {
            const promiseResult = await simulationService.simulateTransaction(
              debouncedRoute.tx,
              debouncedChainId,
              debouncedForceProviderSimulation
            );

            if (promiseResult) {
              setState({ result: promiseResult, error: undefined, isLoading: false });
              if (promiseResult.simulationResults.error) {
                trackEvent('Aggregator - Transaction simulation error', { source: debouncedRoute.swapper.id });
              } else {
                trackEvent('Aggregator - Transaction simulation successfull', { source: debouncedRoute.swapper.id });
              }
            } else {
              setState({ result: undefined, error: ALL_SWAP_OPTIONS_FAILED, isLoading: false });
              trackEvent('Aggregator - Transaction simulation error', { source: debouncedRoute.swapper.id });
            }
          } catch (e) {
            setState({ result: undefined, error: e as string, isLoading: false });
            trackEvent('Aggregator - Transaction simulation error', { source: debouncedRoute.swapper.id });
          }
        }
      },
      500
    ),
    [setState]
  );

  const fetchOptions = React.useCallback(
    () => debouncedCall(route, chainId, forceProviderSimulation),
    [route, chainId, forceProviderSimulation]
  );

  React.useEffect(() => {
    if (
      !skip &&
      ((!isLoading && !result && !error) ||
        !isEqual(prevTxData, txData) ||
        !isEqual(prevForceProviderSimulation, forceProviderSimulation))
    ) {
      if (txData) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchOptions();
      }
    }
  }, [
    prevTxData,
    txData,
    isLoading,
    skip,
    result,
    error,
    fetchOptions,
    forceProviderSimulation,
    prevForceProviderSimulation,
  ]);

  if (!route) {
    return [undefined, false, undefined, fetchOptions];
  }

  const resultToReturn = !error ? result || prevResult : undefined;

  return [resultToReturn, isLoading, error, fetchOptions];
}

export default useSimulateTransaction;
