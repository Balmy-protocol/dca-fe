import React from 'react';
import isUndefined from 'lodash/isUndefined';
import usePrevious from 'hooks/usePrevious';
import { YieldOptions } from 'types';
import useCurrentNetwork from './useCurrentNetwork';
import useWalletService from './useWalletService';
import useYieldService from './useYieldService';

function useYieldOptions(chainId?: number): [YieldOptions | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const yieldService = useYieldService();
  const walletService = useWalletService();
  const [result, setResult] = React.useState<YieldOptions | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const currentNetwork = useCurrentNetwork();
  const chainIdToUse = chainId || currentNetwork.chainId;
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    async function callPromise() {
      try {
        const options = await yieldService.getYieldOptions(chainIdToUse);
        setResult(options);
        setError(undefined);
      } catch (e) {
        setError(e);
      }

      setIsLoading(false);
    }

    if (!isLoading && isUndefined(result) && !error) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, walletService.getAccount(), currentNetwork]);

  return [result || prevResult, isLoading, error];
}

export default useYieldOptions;
