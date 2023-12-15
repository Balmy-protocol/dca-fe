import React from 'react';
import { SwapOption, Token } from '@types';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { parseUnits } from 'viem';
import {
  GasKeys,
  SORT_LEAST_GAS,
  SORT_MOST_PROFIT,
  SORT_MOST_RETURN,
  SwapSortOptions,
  TimeoutKey,
} from '@constants/aggregator';
import { useBlockNumber } from '@state/block-number/hooks';

import { MAX_UINT_32 } from '@constants';
import useAggregatorService from './useAggregatorService';
import useSelectedNetwork from './useSelectedNetwork';
import useActiveWallet from './useActiveWallet';

export const ALL_SWAP_OPTIONS_FAILED = 'all swap options failed';

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
): [SwapOption[] | undefined, boolean, string | undefined, () => void] {
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: SwapOption[];
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const hasPendingTransactions = useHasPendingTransactions();
  const aggregatorService = useAggregatorService();
  const prevFrom = usePrevious(from);
  const prevTo = usePrevious(to);
  const prevValue = usePrevious(value);
  const prevIsBuyOrder = usePrevious(isBuyOrder);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const activeWallet = useActiveWallet();
  const account = activeWallet?.address;
  const currentNetwork = useSelectedNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
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
        if (debouncedFrom && debouncedTo && debouncedValue) {
          const sellBuyValue = debouncedIsBuyOrder
            ? parseUnits(debouncedValue, debouncedTo.decimals)
            : parseUnits(debouncedValue, debouncedFrom.decimals);

          if (sellBuyValue.lte(BigNumber.from(0))) {
            return;
          }

          setState({ isLoading: true, result: undefined, error: undefined });

          try {
            const promiseResult = await aggregatorService.getSwapOptions(
              debouncedFrom,
              debouncedTo,
              debouncedIsBuyOrder ? undefined : parseUnits(debouncedValue, debouncedFrom.decimals),
              debouncedIsBuyOrder ? parseUnits(debouncedValue, debouncedTo.decimals) : undefined,
              SORT_MOST_PROFIT,
              debouncedTransferTo,
              debouncedSlippage,
              debouncedGasSpeed,
              debouncedAccount,
              debouncedChainId,
              debouncedDisabledDexes,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              debouncedIsPermit2Enabled,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              debouncedSourceTimeout
            );

            if (promiseResult.length) {
              setState({ result: promiseResult, error: undefined, isLoading: false });
            } else {
              setState({ result: undefined, error: ALL_SWAP_OPTIONS_FAILED, isLoading: false });
            }
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
      // !isEqual(account, prevAccount) ||
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
    // prevAccount,
    account,
    prevPendingTrans,
    prevBlockNumber,
    blockNumber,
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

  if (!from || !value) {
    return [undefined, false, undefined, fetchOptions];
  }

  let resultToReturn = !error ? result || prevResult : undefined;

  if (sorting === SORT_LEAST_GAS && resultToReturn) {
    resultToReturn = [...resultToReturn].sort((a, b) =>
      a.gas?.estimatedCost.lt(b.gas?.estimatedCost || MAX_UINT_32) ? -1 : 1
    );
  }

  if (sorting === SORT_MOST_RETURN && resultToReturn) {
    if (isBuyOrder) {
      resultToReturn = [...resultToReturn].sort((a, b) => (a.sellAmount.amount.lt(b.sellAmount.amount) ? -1 : 1));
    } else {
      resultToReturn = [...resultToReturn].sort((a, b) => (a.buyAmount.amount.gt(b.buyAmount.amount) ? -1 : 1));
    }
  }

  return [resultToReturn, isLoading, error, fetchOptions];
}

export default useSwapOptions;
