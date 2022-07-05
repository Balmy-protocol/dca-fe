import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { EMPTY_TOKEN } from 'mocks/tokens';
import { useBlockNumber } from 'state/block-number/hooks';
import useCurrentNetwork from './useCurrentNetwork';
import useWalletService from './useWalletService';

function useAllowance(
  from: Token | undefined | null
): [{ token: Token; allowance: string } | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const walletService = useWalletService();
  const [result, setResult] = React.useState<{ token: Token; allowance: string } | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const account = usePrevious(walletService.getAccount());
  const currentNetwork = useCurrentNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    async function callPromise() {
      if (from) {
        try {
          const promiseResult = await walletService.getAllowance(from);
          setResult(promiseResult);
          setError(undefined);
        } catch (e) {
          setError(e);
        }
        setIsLoading(false);
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(account, walletService.getAccount()) ||
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      (blockNumber &&
        prevBlockNumber &&
        blockNumber !== -1 &&
        prevBlockNumber !== -1 &&
        !isEqual(prevBlockNumber, blockNumber))
    ) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    from,
    isLoading,
    result,
    error,
    hasPendingTransactions,
    walletService.getAccount(),
    prevBlockNumber,
    blockNumber,
  ]);

  if (!from) {
    return [{ token: from || EMPTY_TOKEN, allowance: '0' }, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useAllowance;
