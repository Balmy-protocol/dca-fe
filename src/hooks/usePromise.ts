import React from 'react';
import { Web3Service, Web3ServicePromisableMethods } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';

function usePromise(
  promise: Web3Service,
  functionName: Web3ServicePromisableMethods,
  parameters: any[] = [],
  skip: boolean = false
) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(undefined);
  const [error, setError] = React.useState<any>(undefined);
  const prevParameters = usePrevious(parameters);

  React.useEffect(() => {
    // setResult(undefined);
    setError(undefined);
  }, [functionName, parameters]);

  React.useEffect(() => {
    async function callPromise() {
      try {
        const promiseResult = await promise[functionName](...parameters);
        setResult(promiseResult);
        setIsLoading(false);
        setError(undefined);
      } catch (e) {
        setError(e);
      }
    }

    if (!skip && !isLoading && (!result || !isEqual(prevParameters, parameters))) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);
      callPromise();
    }
  }, [functionName, parameters, skip, isLoading, result]);

  return [result, isLoading, error];
}

export default usePromise;
