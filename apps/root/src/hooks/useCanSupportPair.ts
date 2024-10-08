import React from 'react';
import { Token } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import isUndefined from 'lodash/isUndefined';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import usePairService from './usePairService';

function useCanSupportPair(
  from: Token | undefined | null,
  to: Token | undefined | null,
  chainId: number
): [boolean | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const pairService = usePairService();
  const [result, setResult] = React.useState<boolean | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevTo = usePrevious(to);
  const prevChainId = usePrevious(chainId);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    function callPromise() {
      if (from && to) {
        try {
          const promiseResult = pairService.canSupportPair(from, to, chainId);
          setResult(promiseResult);
          setError(undefined);
        } catch (e) {
          setError(e as string);
        }
      }
      setIsLoading(false);
    }

    if (
      (!isLoading && isUndefined(result) && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(prevTo, to) ||
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      !isEqual(chainId, prevChainId)
    ) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, to, isLoading, result, error, hasPendingTransactions, chainId]);

  if (!from) {
    return [prevResult || true, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useCanSupportPair;
