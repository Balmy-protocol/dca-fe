import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import { useBlockNumber } from 'state/block-number/hooks';
import useCurrentNetwork from './useCurrentNetwork';
import useWalletService from './useWalletService';

function useBalance(from: Token | undefined | null): [BigNumber | undefined, boolean, string?] {
  const walletService = useWalletService();
  const [state, setState] = React.useState<{ isLoading: boolean; result?: BigNumber; error?: string }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(walletService.getAccount());
  const account = walletService.getAccount();
  const currentNetwork = useCurrentNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevResult = usePrevious(state.result, false);

  React.useEffect(() => {
    async function callPromise() {
      if (from) {
        try {
          const promiseResult = await walletService.getBalance(from.address);
          setState({ isLoading: false, result: promiseResult, error: undefined });
        } catch (e) {
          setState((prevState) => ({ ...prevState, error: e, isLoading: false }));
        }
      }
    }

    if (
      (!state.isLoading && !state.result && !state.error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(account, prevAccount) ||
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      (blockNumber &&
        prevBlockNumber &&
        blockNumber !== -1 &&
        prevBlockNumber !== -1 &&
        !isEqual(prevBlockNumber, blockNumber))
    ) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    from,
    prevFrom,
    state.isLoading,
    state.result,
    state.error,
    hasPendingTransactions,
    prevAccount,
    account,
    prevBlockNumber,
    blockNumber,
  ]);

  if (!from) {
    return [undefined, false, undefined];
  }

  return [state.result || prevResult, state.isLoading, state.error];
}

export default useBalance;
