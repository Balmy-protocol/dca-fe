import React from 'react';
import isEqual from 'lodash/isEqual';
import usePrevious from './usePrevious';
import useWeb3Service from './useWeb3Service';
import useAccount from './useAccount';

function useSupportsSigning(): [boolean | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const web3Service = useWeb3Service();
  const [result, setResult] = React.useState<boolean | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const currentAccount = useAccount();
  const account = usePrevious(currentAccount);

  React.useEffect(() => {
    function callPromise() {
      try {
        const promiseResult = web3Service.getSignSupport();
        setResult(promiseResult);
        setError(undefined);
      } catch (e) {
        setError(e);
      }
      setIsLoading(false);
    }

    if ((!isLoading && result === undefined && !error) || !isEqual(account, currentAccount)) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, currentAccount, account]);

  return [result, isLoading, error];
}

export default useSupportsSigning;
