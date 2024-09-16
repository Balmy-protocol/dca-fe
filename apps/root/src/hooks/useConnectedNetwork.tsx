import React from 'react';
import { Network, NetworkStruct } from '@types';
import isUndefined from 'lodash/isUndefined';
import useCurrentNetwork from './useCurrentNetwork';
import usePrevious from './usePrevious';
import useProviderService from './useProviderService';
import useActiveWallet from './useActiveWallet';

function useConnectedNetwork(): [NetworkStruct | Network | undefined, boolean, string | undefined] {
  const [{ result, isLoading, error }, setResults] = React.useState<{
    result: NetworkStruct | Network | undefined;
    isLoading: boolean;
    error: string | undefined;
  }>({ result: undefined, isLoading: false, error: undefined });
  const providerService = useProviderService();
  const currentNetwork = useCurrentNetwork();
  const prevResult = usePrevious(result, false);
  const activeWallet = useActiveWallet();

  React.useEffect(() => {
    async function callPromise() {
      try {
        const promiseResult = await providerService.getNetwork(activeWallet?.address);
        setResults({ result: promiseResult, isLoading: false, error: undefined });
      } catch (e) {
        setResults({ result: undefined, isLoading: false, error: e as string });
      }
    }

    if (!isLoading && isUndefined(result) && !error) {
      setResults({ result: undefined, isLoading: true, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, activeWallet?.address, currentNetwork]);

  return [result || prevResult, isLoading, error];
}

export default useConnectedNetwork;
