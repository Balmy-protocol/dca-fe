import React from 'react';
import Web3Service, { CallableMethods } from 'services/web3Service';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';

function usePromise(promise: Web3Service, functionName: CallableMethods, parameters: any[], skip: boolean) {
  const [isLoading, setIsLoading] = React.useState(!skip);
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
