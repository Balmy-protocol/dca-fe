import React from 'react';
import isUndefined from 'lodash/isUndefined';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { YieldOptions } from 'types';
import useSelectedNetwork from './useSelectedNetwork';
import useYieldService from './useYieldService';
import useAccount from './useAccount';

function useYieldOptions(chainId?: number, useBlacklist = false): [YieldOptions | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const yieldService = useYieldService();
  const [result, setResult] = React.useState<YieldOptions | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const currentNetwork = useSelectedNetwork();
  const chainIdToUse = chainId || currentNetwork.chainId;
  const prevChainId = usePrevious(chainIdToUse);
  const prevUseBlacklist = usePrevious(useBlacklist);
  const prevResult = usePrevious(result, false);
  const account = useAccount();

  React.useEffect(() => {
    async function callPromise() {
      try {
        const options = await yieldService.getYieldOptions(chainIdToUse, useBlacklist);
        setResult(options);
        setError(undefined);
      } catch (e) {
        setError(e);
      }

      setIsLoading(false);
    }

    if (
      (!isLoading && isUndefined(result) && !error) ||
      !isEqual(prevChainId, chainIdToUse) ||
      !isEqual(prevUseBlacklist, useBlacklist)
    ) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, account, currentNetwork, chainIdToUse, prevChainId, useBlacklist, prevUseBlacklist]);

  return [result || prevResult, isLoading, error];
}

export default useYieldOptions;
