import React from 'react';
import { Token } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { BigNumber } from 'ethers';
import { useBlockNumber } from '@state/block-number/hooks';
import useSelectedNetwork from './useSelectedNetwork';
import useWalletService from './useWalletService';
import useAccount from './useAccount';

function useBalance(from: Token | undefined | null): [BigNumber | undefined, boolean, string?] {
  const account = useAccount();
  const walletService = useWalletService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: BigNumber;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(account);
  const currentNetwork = useSelectedNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    async function callPromise() {
      if (from) {
        try {
          const promiseResult = await walletService.getBalance(from.address);
          setState({ isLoading: false, result: promiseResult, error: undefined });
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if (
      (!isLoading && !result && !error) ||
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
    isLoading,
    result,
    error,
    hasPendingTransactions,
    prevAccount,
    account,
    prevBlockNumber,
    blockNumber,
    prevFrom,
    walletService,
    prevPendingTrans,
  ]);

  if (!from) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useBalance;
