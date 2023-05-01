import React from 'react';
import { FullPosition } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { BigNumber } from 'ethers';
import { POSITION_ACTIONS } from '@constants';
import usePriceService from './usePriceService';

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
            BigNumber.from(position.rate),
            position.chainId
          );

          const totalGasSaved = filteredPositionActions.reduce<BigNumber>(
            (acc, { createdAtTimestamp, transaction: { gasPrice, l1GasPrice, overhead } }) => {
              const baseGas = BigNumber.from(gasPrice || '0').mul(BigNumber.from(gasUsed));

              const oeGas =
                opGasUsed?.add(BigNumber.from(overhead || '0')).mul(BigNumber.from(l1GasPrice || '0')) ||
                BigNumber.from(0);

              const saved = baseGas.add(oeGas).mul(protocolTokenHistoricPrices[createdAtTimestamp]);

              return acc.add(saved);
            },
            BigNumber.from(0)
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
