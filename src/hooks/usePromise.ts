// import React from 'react';
// import Web3Service, { CallableMethods } from 'services/web3Service';

// function usePromise(promise: () => Promise<any>, shouldQueryAgain: boolean) {
//   const [isLoading, setIsLoading] = React.useState(!true);
//   const [result, setResult] = React.useState<any>(undefined);
//   const [error, setError] = React.useState<any>(undefined);

//   console.log('this is the result', result);
//   // reset states when promise or skip changes
//   // React.useEffect(() => {
//   //   setIsLoading(!skip);
//   //   setResult(undefined);
//   //   setError(undefined);
//   // }, [skip, functionName]);

//   React.useEffect(() => {
//     async function callPromise() {
//       try {
//         const promiseResult = await promise();
//         setIsLoading(false);
//         setResult(promiseResult);
//         setError(undefined);
//         console.log('promise has resolved', promiseResult);
//       } catch(e) {
//         console.log(e);
//       }
//     }

//     if(shouldQueryAgain) {
//       callPromise();
//     }
//   }, [shouldQueryAgain])
//   // React.useMemo(() => { console.log('callingBalance', functionName, parameters, skip); return !skip && promise[functionName](...parameters).then(setResult).catch(setError) }, [functionName, parameters, skip]);

//   return [result, isLoading, error];
// }

// export default usePromise;
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

    console.log('should call the promise', skip, isLoading, result);
    if (!skip && !isLoading && (!result || !isEqual(prevParameters, parameters))) {
      console.log('calling the promise with', parameters);
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);
      callPromise();
    }
  }, [functionName, parameters, skip, isLoading, result]);

  return [result, isLoading, error];
}

export default usePromise;
