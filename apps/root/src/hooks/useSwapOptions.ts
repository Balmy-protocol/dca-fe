import React from 'react';
import { SwapOption, Token } from '@types';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { Address, parseUnits } from 'viem';
import { GasKeys, SORT_MOST_PROFIT, SwapSortOptions, TimeoutKey } from '@constants/aggregator';
import { v4 as uuidv4 } from 'uuid';

import useAggregatorService from './useAggregatorService';
import useSelectedNetwork from './useSelectedNetwork';
import useActiveWallet from './useActiveWallet';
import { EstimatedQuoteResponse, EstimatedQuoteResponseWithTx, QuoteResponseWithTx, sortQuotesBy } from '@balmy/sdk';
import { quoteResponseToSwapOption } from '@common/utils/quotes';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useSimulationService from './useSimulationService';

export const ALL_SWAP_OPTIONS_FAILED = 'all swap options failed';

type ResultType = (EstimatedQuoteResponse | QuoteResponseWithTx | EstimatedQuoteResponseWithTx) & {
  transferTo?: Nullable<Address>;
};

function useSwapOptions(
  from: Token | undefined | null,
  to: Token | undefined | null,
  value?: string,
  isBuyOrder?: boolean,
  sorting?: SwapSortOptions,
  transferTo?: string | null,
  slippage?: number,
  gasSpeed?: GasKeys,
  disabledDexes?: string[],
  isPermit2Enabled = false,
  sourceTimeout = TimeoutKey.patient
): [
  (
    | {
        resultsPromise?: Record<string, Promise<EstimatedQuoteResponse | QuoteResponseWithTx | null>>;
        results?: SwapOption[];
        totalQuotes: number;
      }
    | undefined
  ),
  boolean,
  string | undefined,
  () => void,
] {
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: {
      id: string;
      resultsPromise: Record<string, Promise<EstimatedQuoteResponse | QuoteResponseWithTx | null>>;
      results: ResultType[];
      quotesToSimulate: EstimatedQuoteResponseWithTx[];
      totalQuotes: number;
    };
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const hasPendingTransactions = useHasPendingTransactions();
  const simulationService = useSimulationService();
  const aggregatorService = useAggregatorService();
  const prevFrom = usePrevious(from);
  const prevTo = usePrevious(to);
  const prevValue = usePrevious(value);
  const prevIsBuyOrder = usePrevious(isBuyOrder);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const activeWallet = useActiveWallet();
  const account = activeWallet?.address;
  const currentNetwork = useSelectedNetwork();
  const prevTransferTo = usePrevious(transferTo);
  const prevNetwork = usePrevious(currentNetwork.chainId);
  const prevResult = usePrevious(result, false);
  const prevGasSpeed = usePrevious(gasSpeed);
  const prevSlippage = usePrevious(slippage);
  const prevDisabledDexes = usePrevious(disabledDexes);
  const prevIsPermit2Enabled = usePrevious(isPermit2Enabled);
  const prevSourceTimeout = usePrevious(sourceTimeout);
  const debouncedCall = React.useCallback(
    debounce(
      async (
        debouncedFrom?: Token | null,
        debouncedTo?: Token | null,
        debouncedValue?: string,
        debouncedIsBuyOrder?: boolean,
        debouncedTransferTo?: string | null,
        debouncedGasSpeed?: GasKeys,
        debouncedSlippage?: number,
        debouncedAccount?: string,
        debouncedChainId?: number,
        debouncedDisabledDexes?: string[],
        debouncedIsPermit2Enabled = false,
        debouncedSourceTimeout = TimeoutKey.patient
      ) => {
        if (debouncedFrom && debouncedTo && debouncedValue && debouncedChainId) {
          const sellBuyValue = debouncedIsBuyOrder
            ? parseUnits(debouncedValue, debouncedTo.decimals)
            : parseUnits(debouncedValue, debouncedFrom.decimals);

          if (sellBuyValue <= 0n) {
            return;
          }

          setState({ isLoading: true, result: undefined, error: undefined });

          try {
            const promiseResult = await aggregatorService.getSwapOptionsPromise({
              from: debouncedFrom,
              to: debouncedTo,
              sellAmount: debouncedIsBuyOrder ? undefined : parseUnits(debouncedValue, debouncedFrom.decimals),
              buyAmount: debouncedIsBuyOrder ? parseUnits(debouncedValue, debouncedTo.decimals) : undefined,
              transferTo: debouncedTransferTo,
              slippage: debouncedSlippage,
              gasSpeed: debouncedGasSpeed,
              takerAddress: debouncedAccount as Address,
              chainId: debouncedChainId,
              disabledDexes: debouncedDisabledDexes,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              usePermit2: debouncedIsPermit2Enabled,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              sourceTimeout: debouncedSourceTimeout,
            });

            const resultId = uuidv4();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const entries: [
              string,
              Promise<EstimatedQuoteResponse | EstimatedQuoteResponseWithTx | QuoteResponseWithTx | null>,
            ][] = Object.entries(promiseResult);

            setState({
              isLoading: true,
              error: undefined,
              result: {
                id: resultId,
                resultsPromise: promiseResult,
                results: [],
                totalQuotes: entries.length,
                quotesToSimulate: [],
              },
            });

            // Now we have a promise for each swapper to return their builtQuote
            entries.forEach(([swapper, promise]) => {
              promise
                .then((response) => {
                  return setState((state) => {
                    if (state.result?.id !== resultId) {
                      return state;
                    }

                    // As the promises get resolved we delete them from our resultsPromise
                    const newPromiseResults = { ...state.result?.resultsPromise };
                    delete newPromiseResults[swapper];

                    // Now IF the from address is the native token, we can also already simulate the quotes since there will be no trnasaction steps
                    if (debouncedFrom.address === PROTOCOL_TOKEN_ADDRESS && debouncedIsPermit2Enabled) {
                      const newQuotesToSimulate = [...(state.result?.quotesToSimulate || [])];

                      if (response) {
                        newQuotesToSimulate.push(response as EstimatedQuoteResponseWithTx);
                      }

                      const newState = {
                        ...state,
                        result: {
                          ...state.result,
                          id: state.result.id,
                          resultsPromise: newPromiseResults,
                          quotesToSimulate: newQuotesToSimulate,
                        },
                      };

                      if (Object.keys(newPromiseResults).length === 0) {
                        // If all quotes have been built already now we simulate them, since it can simulate all quotes in just one RPC call
                        simulationService
                          .simulateQuoteResponses({
                            quotes: newQuotesToSimulate,
                            user: debouncedAccount as Address,
                            from: debouncedFrom,
                            sorting: sorting || SORT_MOST_PROFIT,
                            transferTo: debouncedTransferTo,
                            chainId: debouncedChainId,
                            buyAmount: debouncedIsBuyOrder
                              ? parseUnits(debouncedValue, debouncedTo.decimals)
                              : undefined,
                          })
                          // eslint-disable-next-line promise/no-nesting
                          .then((simulatedQuotes) => {
                            return setState((oldState) => {
                              if (oldState.result?.id !== resultId) {
                                return oldState;
                              }

                              // Once the simulated quotes are finished we can set them as the final results
                              const oldNewState = {
                                ...oldState,
                                isLoading: false,
                                result: {
                                  ...oldState.result,
                                  id: oldState.result.id,
                                  resultsPromise: {},
                                  quotesToSimulate: [],
                                  results: simulatedQuotes.map(
                                    (simulatedQuote) =>
                                      ({ ...simulatedQuote, transferTo: debouncedTransferTo }) as ResultType
                                  ),
                                },
                              };

                              return oldNewState;
                            });
                          })
                          // eslint-disable-next-line promise/no-nesting
                          .catch(() => {
                            setState({ result: undefined, error: ALL_SWAP_OPTIONS_FAILED, isLoading: false });
                          });
                      }

                      // We dont want to update the results array as we do below since we need to simulate them first
                      return newState;
                    }

                    const newResults = [...(state.result?.results || [])];

                    if (response) {
                      newResults.push({ ...response, transferTo: debouncedTransferTo as Address });
                    }

                    const hasToLoadMore = Object.keys(newPromiseResults).length > 0;
                    const possibleError =
                      newResults.length === 0 && !hasToLoadMore ? ALL_SWAP_OPTIONS_FAILED : undefined;
                    // And we start pushing those results into our results array
                    const newState = {
                      ...state,
                      error: possibleError,
                      result: {
                        ...state.result,
                        id: state.result.id,
                        resultsPromise: newPromiseResults,
                        results: newResults,
                      },
                      isLoading: hasToLoadMore,
                    };

                    return newState;
                  });
                })
                .catch((e) => {
                  // Should actually never enter here since we catch the errors beforehand on the aggService
                  console.error('Error with quote response', e);
                });
            });
          } catch (e) {
            setState({ result: undefined, error: e as string, isLoading: false });
          }
        }
      },
      750
    ),
    [setState]
  );

  const fetchOptions = React.useCallback(
    () =>
      debouncedCall(
        from,
        to,
        value,
        isBuyOrder,
        transferTo,
        gasSpeed,
        slippage,
        account,
        currentNetwork.chainId,
        disabledDexes,
        isPermit2Enabled,
        sourceTimeout
      ),
    [
      from,
      to,
      value,
      isBuyOrder,
      transferTo,
      slippage,
      gasSpeed,
      account,
      currentNetwork.chainId,
      disabledDexes,
      isPermit2Enabled,
      sourceTimeout,
    ]
  );

  React.useEffect(() => {
    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(prevTo, to) ||
      !isEqual(prevValue, value) ||
      !isEqual(prevIsBuyOrder, isBuyOrder) ||
      !isEqual(prevTransferTo, transferTo) ||
      !isEqual(prevGasSpeed, gasSpeed) ||
      !isEqual(prevNetwork, currentNetwork.chainId) ||
      !isEqual(prevDisabledDexes, disabledDexes) ||
      !isEqual(prevIsPermit2Enabled, isPermit2Enabled) ||
      !isEqual(prevSlippage, slippage) ||
      !isEqual(prevSourceTimeout, sourceTimeout)
    ) {
      if (from && to && value) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchOptions();
      }
    }
  }, [
    from,
    prevFrom,
    isLoading,
    result,
    error,
    prevTo,
    prevIsBuyOrder,
    prevValue,
    value,
    to,
    isBuyOrder,
    prevDisabledDexes,
    disabledDexes,
    sourceTimeout,
    prevSourceTimeout,
    account,
    prevPendingTrans,
    fetchOptions,
    prevTransferTo,
    transferTo,
    slippage,
    prevSlippage,
    gasSpeed,
    prevGasSpeed,
    prevNetwork,
    currentNetwork.chainId,
    isPermit2Enabled,
    prevIsPermit2Enabled,
  ]);

  return React.useMemo(() => {
    const resultToReturn = !error ? result || prevResult : undefined;
    const res = resultToReturn
      ? {
          results: sortQuotesBy(resultToReturn?.results || [], sorting ?? 'most-swapped', 'sell/buy amounts').map(
            quoteResponseToSwapOption
          ),
          resultsPromise: resultToReturn?.resultsPromise,
          totalQuotes: resultToReturn?.totalQuotes,
        }
      : undefined;

    return [res, isLoading, error, fetchOptions];
  }, [result, isLoading, error, fetchOptions, sorting]);
}

export default useSwapOptions;
