import React from 'react';
import { SwapOption, Token } from 'types';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { parseUnits } from '@ethersproject/units';
import { useBlockNumber } from 'state/block-number/hooks';
import useCurrentNetwork from './useCurrentNetwork';
import useAggregatorService from './useAggregatorService';
import useWalletService from './useWalletService';

function useSwapOptions(
  from: Token | undefined | null,
  to: Token | undefined | null,
  value?: string,
  isBuyOrder?: boolean,
  sorting?: string,
  transferTo?: string | null
): [SwapOption[] | undefined, boolean, string | undefined, () => void] {
  const walletService = useWalletService();
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
  const prevAccount = usePrevious(walletService.getAccount());
  const account = walletService.getAccount();
  const currentNetwork = useCurrentNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevSorting = usePrevious(sorting);
  const prevTransferTo = usePrevious(transferTo);
  const prevResult = usePrevious(result, false);
  const debouncedCall = React.useCallback(
    debounce(
      async (
        debouncedFrom?: Token | null,
        debouncedTo?: Token | null,
        debouncedValue?: string,
        debouncedIsBuyOrder?: boolean,
        debouncedSorting?: string,
        debouncedTransferTo?: string | null
      ) => {
        if (debouncedFrom && debouncedTo && debouncedValue) {
          setState({ isLoading: true, result: undefined, error: undefined });

          try {
            const promiseResult = await aggregatorService.getSwapOptions(
              debouncedFrom,
              debouncedTo,
              debouncedIsBuyOrder ? undefined : parseUnits(debouncedValue, debouncedFrom.decimals),
              debouncedIsBuyOrder ? parseUnits(debouncedValue, debouncedTo.decimals) : undefined,
              debouncedSorting,
              debouncedTransferTo
            );
            setState({ result: promiseResult, error: undefined, isLoading: false });
          } catch (e) {
            setState({ result: undefined, error: e as string, isLoading: false });
          }
        }
      },
      500
    ),
    [setState]
  );

  const fetchOptions = React.useCallback(
    () => debouncedCall(from, to, value, isBuyOrder, sorting, transferTo),
    [from, to, value, isBuyOrder, sorting, transferTo]
  );

  React.useEffect(() => {
    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(account, prevAccount) ||
      !isEqual(prevTo, to) ||
      !isEqual(prevValue, value) ||
      !isEqual(prevIsBuyOrder, isBuyOrder) ||
      !isEqual(prevSorting, sorting) ||
      !isEqual(prevTransferTo, transferTo)
    ) {
      if (from && to && value) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchOptions();
        // callPromise();
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
    prevAccount,
    account,
    prevPendingTrans,
    prevBlockNumber,
    blockNumber,
    walletService,
    prevSorting,
    sorting,
    fetchOptions,
    prevTransferTo,
    transferTo,
  ]);

  if (!from) {
    return [undefined, false, undefined, fetchOptions];
  }

  return [result || prevResult, isLoading, error, fetchOptions];
}

export default useSwapOptions;
