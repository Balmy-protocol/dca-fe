import React from 'react';
import { Web3Service, Web3ServicePromisableMethods } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import isUndefined from 'lodash/isUndefined';

function usePromise<T>(
  promise: Web3Service,
  functionName: Web3ServicePromisableMethods,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any[] = [],
  skip = false
): [T | undefined, boolean, { code: number; message: string } | undefined] {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<T | undefined>(undefined);
  const [error, setError] = React.useState<{ code: number; message: string } | undefined>(undefined);
  const prevParameters = usePrevious(parameters);

  React.useEffect(() => {
    async function callPromise() {
      try {
        // eslint-disable-next-line prefer-spread
        const promiseResult = (await promise[functionName].apply(promise, parameters)) as T;
        setResult(promiseResult);
        setError(undefined);
      } catch (e) {
        setError(e);
      }
      setIsLoading(false);
    }

    if (!skip && ((!isLoading && isUndefined(result) && isUndefined(error)) || !isEqual(prevParameters, parameters))) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [functionName, parameters, skip, isLoading, result, error]);

  return [result, isLoading, error];
}

export default usePromise;
