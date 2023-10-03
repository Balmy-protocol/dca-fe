import React from 'react';
import { Token } from '@types';
import usePrevious from '@hooks/usePrevious';
import usePairService from './usePairService';

function useCanSupportPair(
  from: Token | undefined | null,
  to: Token | undefined | null
): [boolean | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const pairService = usePairService();
  const [result, setResult] = React.useState<boolean | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    async function callPromise() {
      if (from && to) {
        try {
          const promiseResult = await pairService.canSupportPair(from, to);
          setResult(promiseResult);
          setError(undefined);
        } catch (e) {
          setError(e as string);
        }
      }
      setIsLoading(false);
    }

    if (!isLoading) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, to, isLoading, pairService]);

  return React.useMemo(() => {
    if (!from) {
      return [prevResult || true, false, undefined];
    }

    return [result || prevResult, isLoading, error];
  }, [error, from, isLoading, prevResult, result]);
}

export default useCanSupportPair;
