import React from 'react';
import { SwapOption, SwapOptionWithTx } from '@types';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import usePrevious from '@hooks/usePrevious';
import { GasKeys } from '@constants/aggregator';
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
  const aggregatorService = useAggregatorService();
  const prevAccount = usePrevious(account);
  const currentNetwork = useSelectedNetwork();
  const prevCurrentNetwork = usePrevious(currentNetwork);
  const prevTransferTo = usePrevious(transferTo);
  const prevNetwork = usePrevious(currentNetwork.chainId);
  const prevResult = usePrevious(result, false);
  const prevGasSpeed = usePrevious(gasSpeed);
  const prevSlippage = usePrevious(slippage);
  const prevQuote = usePrevious(quote);
  const prevUsePermit2 = usePrevious(usePermit2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    [debouncedCall, quote, transferTo, gasSpeed, slippage, account, currentNetwork.chainId, usePermit2]
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
        !isEqual(prevUsePermit2, usePermit2) ||
        !isEqual(prevCurrentNetwork?.chainId, currentNetwork.chainId))
    ) {
      if (quote && account && !quote.tx) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchOptions();
      }
    }
  }, [
    account,
    currentNetwork.chainId,
    error,
    fetchOptions,
    gasSpeed,
    isLoading,
    prevAccount,
    prevCurrentNetwork?.chainId,
    prevGasSpeed,
    prevNetwork,
    prevQuote,
    prevSlippage,
    prevTransferTo,
    prevUsePermit2,
    quote,
    result,
    slippage,
    transferTo,
    usePermit2,
  ]);

  return React.useMemo(() => {
    if (!quote) {
      return [undefined, false, undefined, fetchOptions];
    }

    const resultToReturn = !error ? result || prevResult : undefined;

    return [resultToReturn, isLoading, error, fetchOptions];
  }, [error, fetchOptions, isLoading, prevResult, quote, result]);
}

export default useSwapOptions;
