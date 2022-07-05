import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import usePairService from './usePairService';

function useCanSupportPair(
  from: Token | undefined | null,
  to: Token | undefined | null
): [boolean | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const pairService = usePairService();
  const [result, setResult] = React.useState<boolean | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevTo = usePrevious(to);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    async function callPromise() {
      if (from && to) {
        try {
          const promiseResult = await pairService.canSupportPair(from, to);
          setResult(promiseResult);
          setError(undefined);
        } catch (e) {
          setError(e);
        }
      }
      setIsLoading(false);
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(prevTo, to) ||
      !isEqual(prevPendingTrans, hasPendingTransactions)
    ) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, to, isLoading, result, error, hasPendingTransactions]);

  if (!from) {
    return [prevResult || true, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useCanSupportPair;
