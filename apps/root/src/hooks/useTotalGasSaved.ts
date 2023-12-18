import React from 'react';
import { FullPosition } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';

import { POSITION_ACTIONS } from '@constants';
import usePriceService from './usePriceService';

function useTotalGasSaved(position: FullPosition | undefined | null): [bigint | undefined, boolean, string?] {
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

          const { estimatedGas: gasUsed, estimatedOptimismGas: opGasUsed } = await priceService.getZrxGasSwapQuote(
            position.from,
            position.to,
            BigInt(position.rate),
            position.chainId
          );

          const totalGasSaved = filteredPositionActions.reduce<bigint>(
            (acc, { createdAtTimestamp, transaction: { gasPrice, l1GasPrice, overhead } }) => {
              const baseGas = BigInt(gasPrice || '0') * BigInt(gasUsed);

              const oeGas = (opGasUsed + BigInt(overhead || '0')) * BigInt(l1GasPrice || '0') || 0n;

              const saved = (baseGas + oeGas) * protocolTokenHistoricPrices[createdAtTimestamp];

              return acc + saved;
            },
            0n
          );
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
