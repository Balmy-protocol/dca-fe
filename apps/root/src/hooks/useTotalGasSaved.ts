import React from 'react';
import { Position } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';

import { ActionTypeAction, DCAPositionAction, SwappedAction } from '@balmy/sdk';
import usePriceService from './usePriceService';
import useAggregatorService from './useAggregatorService';
import { SORT_LEAST_GAS } from '@constants/aggregator';

function useTotalGasSaved(position: Position | undefined | null): [bigint | undefined, boolean, string?] {
  const priceService = usePriceService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: bigint;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const prevPosition = usePrevious(position);
  const prevResult = usePrevious(result, false);
  const aggregatorService = useAggregatorService();

  React.useEffect(() => {
    async function callPromise() {
      if (position && position.history) {
        try {
          const filteredPositionActions = position.history.filter(
            (action) => action.action === ActionTypeAction.SWAPPED
          ) as (DCAPositionAction & SwappedAction)[];

          const protocolTokenHistoricPrices = await priceService.getProtocolHistoricPrices(
            filteredPositionActions.map(({ tx: { timestamp } }) => timestamp.toString()),
            position.chainId
          );

          const options = await aggregatorService.getSwapOptions({
            from: position.from,
            to: position.to,
            sellAmount: position.rate.amount,
            sorting: SORT_LEAST_GAS,
            chainId: position.chainId,
          });
          const filteredOptions = options.filter(({ gas }) => !!gas);
          const middleSwapperIndex = Math.floor(filteredOptions.length / 2);
          const leastAffordableOption = filteredOptions[middleSwapperIndex];

          const { gas } = leastAffordableOption;

          if (!gas) {
            return;
          }

          const { estimatedGas } = gas;

          const totalGasSaved = filteredPositionActions.reduce<bigint>((acc, { tx: { timestamp, gasPrice } }) => {
            const saved = estimatedGas * BigInt(gasPrice || 0) * protocolTokenHistoricPrices[timestamp];

            return acc + saved;
          }, 0n);
          setState({ isLoading: false, result: totalGasSaved, error: undefined });
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if ((!isLoading && !result && !error) || !isEqual(prevPosition, position)) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [position, prevPosition, isLoading, result, error]);

  if (!position) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useTotalGasSaved;
