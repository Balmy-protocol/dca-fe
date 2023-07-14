import React from 'react';
import { SwapOption, SwapOptionWithTx } from '@types';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { GasKeys } from '@constants/aggregator';
import { useBlockNumber } from '@state/block-number/hooks';
import useAggregatorService from './useAggregatorService';
import useWalletService from './useWalletService';
import useSelectedNetwork from './useSelectedNetwork';

export const ALL_SWAP_OPTIONS_FAILED = 'all swap options failed';

function useSwapOptions(
  quote?: SwapOption | null,
  transferTo?: string | null,
  slippage?: number,
  gasSpeed?: GasKeys,
  usePermit2?: boolean
): [SwapOptionWithTx | undefined, boolean, string | undefined, () => void] {
  const walletService = useWalletService();
  const account = walletService.getAccount();
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: SwapOptionWithTx;
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const hasPendingTransactions = useHasPendingTransactions();
  const aggregatorService = useAggregatorService();
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(account);
  const currentNetwork = useSelectedNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevTransferTo = usePrevious(transferTo);
  const prevNetwork = usePrevious(currentNetwork.chainId);
  const prevResult = usePrevious(result, false);
  const prevGasSpeed = usePrevious(gasSpeed);
  const prevSlippage = usePrevious(slippage);
  const prevQuote = usePrevious(quote);
  const prevUsePermit2 = usePrevious(usePermit2);
  const debouncedCall = React.useCallback(
    debounce(
      async (
        debouncedQuote?: SwapOption | null,
        debouncedTransferTo?: string | null,
        debouncedGasSpeed?: GasKeys,
        debouncedSlippage?: number,
        debouncedAccount?: string,
        debouncedChainId?: number,
        debouncedUsePermit2?: boolean
      ) => {
        if (debouncedQuote && debouncedAccount) {
          setState({ isLoading: true, result: undefined, error: undefined });

          try {
            const promiseResult = await aggregatorService.getSwapOption(
              debouncedQuote,
              debouncedAccount,
              debouncedTransferTo,
              debouncedSlippage,
              debouncedGasSpeed,
              debouncedChainId,
              debouncedUsePermit2
            );

            if (promiseResult) {
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
    () => debouncedCall(quote, transferTo, gasSpeed, slippage, account, currentNetwork.chainId, usePermit2),
    [quote, transferTo, slippage, gasSpeed, account, currentNetwork.chainId, usePermit2]
  );

  React.useEffect(() => {
    if (
      quote &&
      account &&
      ((!isLoading && !result && !error) ||
        !isEqual(prevQuote, quote) ||
        !isEqual(account, prevAccount) ||
        !isEqual(prevTransferTo, transferTo) ||
        !isEqual(prevGasSpeed, gasSpeed) ||
        !isEqual(prevNetwork, currentNetwork.chainId) ||
        !isEqual(prevSlippage, slippage) ||
        !isEqual(prevUsePermit2, usePermit2))
    ) {
      if (quote && account && !quote.tx) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchOptions();
      }
    }
  }, [
    quote,
    prevQuote,
    isLoading,
    result,
    error,
    prevAccount,
    account,
    prevPendingTrans,
    prevBlockNumber,
    blockNumber,
    walletService,
    fetchOptions,
    prevTransferTo,
    transferTo,
    slippage,
    prevSlippage,
    gasSpeed,
    prevGasSpeed,
    prevNetwork,
    currentNetwork.chainId,
    usePermit2,
    prevUsePermit2,
  ]);

  if (!quote) {
    return [undefined, false, undefined, fetchOptions];
  }

  const resultToReturn = !error ? result || prevResult : undefined;

  return [resultToReturn, isLoading, error, fetchOptions];
}

export default useSwapOptions;
