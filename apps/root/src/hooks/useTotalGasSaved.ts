import React from 'react';
import { FullPosition } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { BigNumber } from 'ethers';
import { POSITION_ACTIONS } from '@constants';
import usePriceService from './usePriceService';
import useAggregatorService from './useAggregatorService';
import { SORT_LEAST_GAS } from '@constants/aggregator';

function useTotalGasSaved(position: FullPosition | undefined | null): [BigNumber | undefined, boolean, string?] {
  const priceService = usePriceService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: BigNumber;
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
      if (position) {
        try {
          const filteredPositionActions = position.history.filter(
            (action) => action.action === POSITION_ACTIONS.SWAPPED
          );

          const protocolTokenHistoricPrices = await priceService.getProtocolHistoricPrices(
            filteredPositionActions.map(({ createdAtTimestamp }) => createdAtTimestamp),
            position.chainId
          );

          const options = await aggregatorService.getSwapOptions(
            position.from,
            position.to,
            BigNumber.from(position.rate),
            undefined,
            SORT_LEAST_GAS,
            undefined,
            undefined,
            undefined,
            undefined,
            position.chainId
          );

          const filteredOptions = options.filter(({ gas }) => !!gas);
          const leastAffordableOption = filteredOptions[filteredOptions.length - 1];

          const { gas } = leastAffordableOption;

          if (!gas) {
            return;
          }

          const { estimatedCost } = gas;

          const totalGasSaved = filteredPositionActions.reduce<BigNumber>((acc, { createdAtTimestamp }) => {
            const saved = estimatedCost.mul(protocolTokenHistoricPrices[createdAtTimestamp]);

            return acc.add(saved);
          }, BigNumber.from(0));
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
