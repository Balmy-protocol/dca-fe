import React from 'react';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import useCurrentNetwork from './useCurrentNetwork';
import usePrevious from './usePrevious';
import useProviderService from './useProviderService';
import useActiveWallet from './useActiveWallet';

function useIsOnCorrectNetwork() {
  const [isLoading, setIsLoading] = React.useState(false);
  const providerService = useProviderService();
  const [result, setResult] = React.useState<boolean | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const currentNetwork = useCurrentNetwork();
  const previousChainId = usePrevious(currentNetwork.chainId);
  const activeWallet = useActiveWallet();

  React.useEffect(() => {
    async function callPromise() {
      try {
        const promiseResult = await providerService.getNetwork(activeWallet?.address);
        const isSameNetwork = currentNetwork.chainId === promiseResult?.chainId;
        setResult(isSameNetwork);
        setError(undefined);
      } catch (e) {
        setError(e as string);
      }
      setIsLoading(false);
    }

    if ((!isLoading && isUndefined(result) && !error) || !isEqual(previousChainId, currentNetwork.chainId)) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, activeWallet?.address, currentNetwork, previousChainId]);

  return [result, isLoading, error];
}

export default useIsOnCorrectNetwork;
